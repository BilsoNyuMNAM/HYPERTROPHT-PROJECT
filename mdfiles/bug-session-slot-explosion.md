# Bug Report: One Day Accumulates Too Many Exercise Slots (Total, Across All Muscles)

**Status:** Open
**Scope:** Frontend slot distribution pipeline (creation time)
**Reference:** `myApparchitecture.md` §4 (Table 1 `p3` / Table 2 `m3`), §2

---

## Symptom

In the Exercise Distribution screen (`Fillexercise.tsx`), one specific day shows a large total slot count (e.g. "7 slots" on Monday) while another training day sits near zero. The overload is **not tied to one muscle** — many different muscles' slots pile onto the same calendar day.

---

## Root Cause

`frontend/helper/getDaysForMuscle.ts` — the day-selection algorithm.

`distributeExercises()` (`Fillexercise.tsx:39`) asks `getDaysForMuscle` which days each muscle trains on, then round-robins that muscle's exercise slots over the returned days. The per-day **total** is therefore decided entirely by which days each muscle's combination picks. That picker has a flaw:

### The workload balancing is tie-break-only

`pickBestCombination` (`getDaysForMuscle.ts:76`) scores every day-combination with `calculatePenaltyScore` — a **pure calendar-spacing score** (points for how close the chosen days sit together). Current schedule load (`getWorkloadForDays`) is consulted **only among combinations tied on the minimum penalty**:

```ts
if (tiedCombinations.length === 1 || !schedule) {
    return tiedCombinations[0]   // workload is NEVER checked here
}
```

When a unique minimum-penalty combination exists, the muscle lands on those days **no matter how loaded they already are**.

### Verified collapse cases (ran the actual penalty function)

| Layout | sessionsCount | Unique min-penalty winner? | Consequence |
| :--- | :--- | :--- | :--- |
| Mon/Wed/Fri (3-day) | 2 | **Yes — always Monday+Friday** (penalty 2 vs 4 for any pair with Wednesday) | Every 2-session muscle stacks on Mon+Fri |
| Mon/Tue/Thu/Sat (4-day) | 3 | Tie of 2, but **both winners contain Thursday** | Every 3-session muscle puts 2 slots on Thursday |

On a 3-day split this is severe. The 2-session muscles per the frontend's Table 1 port (`priorities.tsx:74`) are: fast-recovery Grow, fast/moderate Maintain, moderate Emphasis-Bottom. All of them resolve to the identical unique winner `Monday+Friday`. Each contributes 1–2 slots to Monday and Friday; Wednesday gets nothing from any of them. One-session muscles do tie and balance, but they can't undo the pile-up.

Worked example — 3-day split, moderate/fast mix:

| Muscle | sessionsCount | exerciseCount | Days picked | Monday slots |
| :--- | :---: | :---: | :--- | :---: |
| Biceps (fast, grow) | 2 | 2 | Mon+Fri (unique) | 1 |
| Shoulders (fast, grow) | 2 | 2 | Mon+Fri (unique) | 1 |
| Calves (moderate, maintain) | 2 | 2 | Mon+Fri (unique) | 1 |
| Triceps (moderate, maintain) | 2 | 2 | Mon+Fri (unique) | 1 |
| Back (moderate, emphasis-bottom) | 2 | 3 | Mon+Fri (unique) | 2 |
| **Monday total** | | | | **6** |

Wednesday: 0 slots from any of the above. That is the reported bug.

---

## How This Maps to the md

* The md's §4 only defines **per-muscle** allocations: Table 1 (sessions/week) and Table 2 (total weekly slots). It never defines how a muscle's slots map to specific calendar days — the frontend invented the spacing-penalty algorithm, and it is what breaks the distribution.
* The md's intent for Table 1 is frequency *spreading* with per-session per-muscle counts of 1–2 slots (§4: "1 exercise slot per session"). The code honors per-muscle-per-session counts but violates the day-level balance the table's frequency design implies.
* §2 (days indexed by array position, labels purely cosmetic) means there is no calendar-day concept server-side either — the backend stores `body.days` as sent, so no per-day sanity check exists anywhere else in the stack.

---

## Related (Separate) Issues Found While Debugging

1. **Per-muscle slot explosion on small splits** — the `sessionCount` table in `priorities.tsx:74` encodes only the md Table 1 "4 to 6 Days" row, so on a 2-day split a fast Top-Emphasis muscle asks for 4 sessions/8 slots; `getDaysForMuscle`'s clamp (`sessionsCount >= trainingDays.length → return all days`) then round-robins all 8 slots over 2 days (4 slots of one muscle per session). Same root area, different symptom.
2. **Manual "Add Muscle Group" is unbounded** — `addmusclegroup.tsx:13` appends any muscle to any day with no cap and no check against that muscle's planned weekly slots, silently inflating both the day's slot count and the muscle's weekly volume.

---

## Fix Direction (Official RP Engine Design)

The reference engine prevents this with **two balancing mechanisms and one hard safety check**:

### 1. Statistical Variance Minimization (`VPe`)

When multiple day combinations tie for the lowest spacing penalty, the algorithm **simulates placing the muscle into each candidate schedule** and calculates the **statistical variance of exercises per day** across the week. It picks the schedule with the lowest variance — actively choosing days that currently have fewer exercises so daily workout lengths stay balanced.

This replaces the current tie-break in `pickBestCombination` (`getDaysForMuscle.ts:76`), which only compares *existing* load sums among ties and never simulates the muscle's own upcoming slots. Note it must also apply where the tie winners **share a day** (4-day / 3-session case: both winners contain Thursday — variance simulation of the actual placement is what breaks that).

### 2. Round-Robin Slot Spreading (`wD`)

When a muscle receives multiple slots in a week, they are distributed across the selected days **one by one in a round-robin cycle** rather than dumped onto one session.

This already exists in `distributeExercises` (`Fillexercise.tsx:45`, `slot % targetDays.length`) and should be preserved as-is.

### 3. Hard Limit Safety Guard (`UPe`) — 9 Exercises Per Day

**A training day should never exceed 9 exercises.** If the user prioritizes so many muscles that even balanced distribution pushes any day above **9 exercise slots**, the system flags `tooManyExercises` and displays a warning telling the user to **reduce priorities or add training days**. The guard runs after distribution; it does not silently truncate — the user must resolve the conflict.

### Implementation Notes

* `VPe` must run **inside** `pickBestCombination`'s selection (the day choice), not downstream in `distributeExercises` or the clamp — both are after the decision that causes the pile-up.
* `VPe` simulates placement, so it must copy the candidate schedule (add the muscle's `exerciseCount` slots round-robin per the candidate days) before computing variance — otherwise the shared-day case (Thursday) still ties.
* `UPe` is the final gate in `distributeExercises`: compute per-day totals after all muscles are placed; if any `> 9`, set a `tooManyExercises` flag surfaced in the UI (ToastDialog) instead of calling the create API.

---

## Verification Checklist (after fix)

- [ ] 3-day split: 2-session muscles no longer all resolve to Monday+Friday; day loads balanced via variance minimization
- [ ] 4-day split: 3-session muscles do not all stack on Thursday
- [ ] No training day ever exceeds 9 exercise slots; exceeding configs show the `tooManyExercises` warning instead of creating the mesocycle
- [ ] Per-muscle slots per session stay at 1–2 per the md (regression guard for related issue #1)
- [ ] Add Muscle Group respects the muscle's remaining weekly slot budget
