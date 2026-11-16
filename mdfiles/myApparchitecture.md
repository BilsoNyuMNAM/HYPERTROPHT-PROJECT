# Hypertrophy App Architecture & Progression Engine

This document outlines the full architecture, data contracts, and progression logic for replicating the RP Hypertrophy training system.

---

## 1. Mesocycle Creation Data Contract

When the user configures their training split and clicks **Create Mesocycle**, the frontend sends the following payload to `POST /api/mesocycles`:

```json
{
  "mesocycleName": "Hypertrophy Block 1",
  "length": 5,
  "unit": "lbs",
  "days": [
    {
      "label": "Monday",
      "exercises": [
        { "exerciseId": 101 },
        { "exerciseId": 204 }
      ]
    },
    {
      "label": "Monday",
      "exercises": [
        { "exerciseId": 305 }
      ]
    },
    {
      "label": "Wednesday",
      "exercises": [
        { "exerciseId": 402 }
      ]
    }
  ],
  "priorities": {
    "1": { "muscleGroupId": 1, "priorityType": "emphasize" },
    "2": { "muscleGroupId": 2, "priorityType": "grow" },
    "3": { "muscleGroupId": 3, "priorityType": "maintain" }
  },
  "getRecommendedOverload": true
}
```

### Field Definitions
* **`mesocycleName`** (*string*): User-chosen name for the mesocycle.
* **`length`** (*integer*): Total duration in weeks including accumulation weeks and the final deload week (typically 4 to 8 weeks).
* **`unit`** (*string*): `"lbs"` or `"kg"`.
* **`days`** (*array*): Ordered list of workout days. Each day contains:
  * **`label`** (*string | null*): The display name (e.g., `"Monday"`, or `null` for asynchronous split without fixed calendar days).
  * **`exercises`** (*array*): List of exercises in that session, where each item contains `{ "exerciseId": number }`. **Notice: No sets, reps, or weights are sent by the frontend.**
* **`priorities`** (*object*): Mapping of each of the 12 muscle groups to its focus level:
  * `"emphasize"`: Maximum focus; volume aggressively ramps from minimum to maximum recoverable limits.
  * `"grow"`: Steady growth; volume stays closer to baseline minimum effective volume.
  * `"maintain"`: Preserves muscle size with minimal sets, freeing recovery capacity for prioritized muscles.
* **`getRecommendedOverload`** (*boolean*): When copying or building from a prior mesocycle, pulls forward past weight and rep performance to establish starting targets.

---

## 2. Handling Duplicate Weekday Labels (e.g., Two "Monday"s)

### What Happens in the UI
The weekday picker dropdown provides all 7 days (`Monday` through `Sunday`). There are **no duplicate checks, validation blocks, or disabled options**. A user can freely set Day 1 to `"Monday"` and Day 2 to `"Monday"`.

### What Happens Upon Saving
* **No Validation Errors:** The backend does **not** enforce uniqueness on day labels.
* **Sequential Position Indexing:** Workouts are stored and indexed by their **array position** (`days[0]`, `days[1]`, `days[2]`), not by their weekday name.

### How the Training Tracker Routes and Treats Them
The training tracker uses 1-based sequential routing:
* **Day 1** is routed at `/weeks/1/days/1` (display label: `"Monday"`).
* **Day 2** is routed at `/weeks/1/days/2` (display label: `"Monday"`).

**Why this design exists:**
1. **Two-a-Day Sessions:** A user can schedule a morning session and an evening session on the same day.
2. **Asynchronous / Non-Weekly Splits:** Users who run rotating schedules (e.g., Push/Pull/Legs/Rest on a 4-day rolling cycle) don't map neatly to fixed calendar days.
3. The day `label` is **purely cosmetic** for UI display; the true identity of a session is its position index `position` within that week.

---

## 3. Exercise-to-Muscle Attribution: 100% Primary Attribution

* **Single Muscle Group Mapping:** Every exercise belongs to **exactly one** primary muscle group (stored as a single integer `muscleGroupId` from 1 to 12).
* **No Fractional Sets:** Bench Press counts as **1.0 set to Chest only** (0.0 to Triceps and 0.0 to Front Delts). Barbell Row counts as **1.0 set to Back only** (0.0 to Biceps).
* **Volume Aggregation:** Weekly muscle group volume is calculated strictly by summing completed sets where `exercise.muscleGroupId === targetMuscleGroupId`. Secondary muscles are not credited with fractional volume.

### Canonical 12 Muscle Groups
The system standardizes on exactly 12 discrete muscle groups:

| ID | Muscle Group | Description |
|---|---|---|
| `1` | **Chest** | Pectorals (upper, mid, lower) |
| `2` | **Back (Lats / Width)** | Latissimus dorsi, teres major |
| `3` | **Upper Back (Thickness / Traps)** | Rhomboids, mid/lower traps, rear shoulder girdle |
| `4` | **Quads** | Quadriceps femoris |
| `5` | **Hamstrings** | Posterior thigh (biceps femoris, semitendinosus, semimembranosus) |
| `6` | **Glutes** | Gluteus maximus, medius |
| `7` | **Calves** | Gastrocnemius, soleus |
| `8` | **Biceps** | Biceps brachii, brachialis, brachioradialis |
| `9` | **Triceps** | Triceps brachii (all heads) |
| `10` | **Side Delts** | Lateral deltoid |
| `11` | **Rear Delts** | Posterior deltoid |
| `12` | **Abs** | Rectus abdominis, obliques |

---

## 4. Initial Set Generation (Week 1 Baseline)

When the backend receives the creation request, it calculates the baseline working sets for every exercise across all weeks.

### Baseline Sets Per Exercise Slot (Not Weekly Volume Targets)
The system does **not** assign a weekly volume target and then divide it by exercise count. Instead, every exercise slot starts with a fixed **baseline number of sets** in Week 1:

* **Maintain:** **2 sets** per exercise slot (preserve muscle with minimal fatigue, freeing recovery for focus muscles).
* **Grow:** **3 sets** per exercise slot (establish Minimum Effective Volume).
* **Emphasize:** **3 sets** per exercise slot (same per-slot baseline as Grow — emphasis muscles get **more total weekly volume through more exercise slots** from Table 2, not through more sets per individual exercise).

Weekly volume is an **emergent property** of (exercise slots × baseline sets per slot), not a top-down assignment:
* A Grow muscle with 2 exercise slots → $2 \times 3 = 6$ sets/week
* An Emphasis (Top) muscle with 4 exercise slots → $4 \times 3 = 12$ sets/week
* A Maintain muscle with 2 exercise slots → $2 \times 2 = 4$ sets/week

This prevents the old bug where dividing a large weekly target (e.g., 14 sets) by a small exercise count (e.g., 1 slot) produced 14 sets on a single exercise — far beyond the 2–4 set per-exercise science-based ceiling.

### How Volume & Exercise Slots are Determined (The Two Lookup Tables)
In hypertrophy science, single-exercise stimulus has diminishing returns beyond 2–4 hard sets per session. Therefore, the algorithm distributes volume across frequency slots using a two-table lookup system:

#### 1. Muscle Recovery Speed & Emphasis Split
Every muscle group has a built-in recovery speed:
* **Slow Recovery:** Chest, Quads, Hamstrings, Glutes
* **Moderate Recovery:** Back, Triceps, Calves, Abs
* **Fast Recovery:** Biceps, Shoulders, Traps, Forearms

When muscles are placed into **Emphasis**, the system splits them in half:
* **Top Emphasis (`emphasizeTop`):** The top half of prioritized muscles (maximum volume).
* **Bottom Emphasis (`emphasizeBottom`):** The bottom half (slightly reduced volume to preserve systemic recovery).

#### 2. Table 1 (`p3`): Frequency Lookup (Training Days $\rightarrow$ Sessions Per Week)
Decides how many workout sessions per week a muscle is trained:

| Total Workout Days | Recovery Speed | Maintain (Days/Wk) | Grow (Days/Wk) | Emphasis - Bottom (Days/Wk) | Emphasis - Top (Days/Wk) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **2 Days** | Slow / Moderate | 1 | 1 | 2 | 2 |
| | Fast | 2 | 2 | 2 | 2 |
| **3 Days** | Slow | 1 | 1 | 2 | 2 |
| | Moderate | 1 | 1 | 2 | 3 |
| | Fast | 2 | 2 | 3 | 3 |
| **4 to 6 Days** | Slow | 1 | 1 | 2 | 2 |
| | Moderate | 2 | 2 | 2 | 3 |
| | Fast | 2 | 2 | 3 | 4 |

#### 3. Table 2 (`m3`): Weekly Exercise Slots Lookup (Sessions $\rightarrow$ Total Weekly Slots)
Determines the total number of exercise slots the muscle receives across the week:

| Sessions Per Week | Maintain Slots | Grow Slots | Emphasis - Bottom Slots | Emphasis - Top Slots |
| :---: | :---: | :---: | :---: | :---: |
| **1 Session** | 1 slot | 1 slot | *(Not Allowed)* | *(Not Allowed)* |
| **2 Sessions** | 2 slots | 2 slots | **3 slots** | **4 slots** |
| **3 Sessions** | 3 slots | 3 slots | **5 slots** | **6 slots** |
| **4 Sessions** | 4 slots | 4 slots | **6 slots** | **8 slots** |

---

### How the System Prevents a Muscle from Having 7 or More Sets in a Week (with 2 Exercise Slots & Emphasis)

A core structural design rule in the progression engine is how it handles volume limits for lower-frequency / lower-slot allocations:

1. **Proof 1: Emphasized Muscles Never Receive Only 2 Exercise Slots in the First Place**
   * Looking at Table 2 (`m3`), when an emphasized muscle trains 2 days in a week (`sessionCount = 2`), it is automatically upgraded to **3 exercise slots** (Bottom Emphasis) or **4 exercise slots** (Top Emphasis).
   * The lookup table **never** assigns 2 exercise slots to an emphasized muscle.
   * Only muscles set to **Grow** or **Maintain** receive 2 exercise slots (1 exercise slot per session).

2. **Proof 2: The Mathematical 6-Set Baseline Hard Cap ($2 \times 3 = 6$)**
   * In Week 1, every newly initialized exercise slot starts with a baseline of **2 to 3 working sets** (establishing the Minimum Effective Volume).
   * If a muscle group has only 2 exercise slots in a week, even when assigning the maximum 3 baseline sets per slot:
     $$\text{2 exercise slots} \times \text{3 sets per slot} = \mathbf{6\text{ sets maximum}}$$
   * Two exercise slots mathematically cap weekly volume at **6 sets**. It is physically impossible to reach 7 or more sets in Week 1 with only 2 exercise slots without adding a 3rd exercise slot or manual user overrides.

3. **Proof 3: The Slot Lookup Matrix Skips 7 Completely**
   * Looking at Table 2 (`m3`) across all session counts for Emphasis:
     * 2 sessions $\rightarrow$ **3 or 4 slots**
     * 3 sessions $\rightarrow$ **5 or 6 slots**
     * 4 sessions $\rightarrow$ **6 or 8 slots**
   * For 2 sessions, slot allocation is hard-capped at 3 or 4 slots. Furthermore, across the entire emphasis progression matrix, **the value 7 is entirely omitted** (it transitions directly from 6 slots to 8 slots).

### Blueprint Generation in Database
Upon creation, the backend saves the entire multi-week structure into the database:
* Every exercise in Week 1 through Week $N$ is assigned an initial `sets` array with default status `pending`.
* These baseline sets represent the starting blueprint for the mesocycle.

---

## 5. Calendar Navigation & Future Days Preview

### How the Calendar Navigation Works
In the training view header, clicking the **Calendar button** opens a navigation drawer listing every week and day:
* Columns represent **Weeks** (Week 1, Week 2, ..., DL for Deload), showing the target RIR for that week.
* Rows represent **Days** (Day 1, Day 2, ..., Day $K$) displaying their label (e.g. `"Monday"` or `"Day 1"`).
* Clicking any day navigates directly to `/weeks/{weekNumber}/days/{dayNumber}`.

### What Sets are Displayed for Future / Other Days
When a user clicks on an upcoming workout (such as Week 2 Day 1, or Week 1 Day 3):
* **It displays the set rows currently materialized in the database** — the baseline rows created at mesocycle creation, already mutated by any progression writes that have run since.
* Because no feedback has been submitted for preceding workouts yet, upcoming workouts show their **baseline sets**.
* Future workouts only change **after** the preceding workouts are completed and user feedback is submitted (see §11.E).

---

## 6. Progression Engine: RIR, Reps, and Weight

Set count is only one dimension of progressive overload. The app drives progression using three interlocking mechanisms:

### A. The Target RIR Schedule (`microRirs`)
Every mesocycle stores an encoded RIR schedule defining how close to failure sets must be taken each week:
* **Week 1:** 3 RIR (3 reps in reserve / 3 reps away from failure)
* **Week 2:** 2 RIR (2 reps in reserve)
* **Week 3:** 1 RIR (1 rep in reserve)
* **Week 4:** 0 RIR (take sets all the way to concentric failure)
* **Final Week (Deload):** 4 to 5 RIR (light active recovery)

```javascript
// RIR extracted from encoded microRirs string per week
function PC(t = true) {
  const { meso: e, day: r } = en();
  return yZ(e.microRirs, t)[r.week];
}
```

---

### B. Rep Progression (Rep Overload Track)
Each set tracks `reps` (logged reps) and `repsTarget` (recommended reps).

#### Week 1 Behavior:
* In Week 1, `repsTarget` is `null`. 
* The reps input placeholder displays `"${targetRir} RIR"` (e.g., `"3 RIR"`), and the recommendation prompt shows: `"We recommend 3 RIR"`.
* The lifter warms up, chooses a weight that lands in the hypertrophy rep range (5–10 reps for beginners, 5–20 reps for intermediates), and stops when they reach the target RIR.

#### Week 2+ Progression Formula:
Progression is tracked by **workout slot across weeks**:
* If an exercise appears on multiple days in the same week (e.g., Bench Press on Monday Day 1, and Bench Press again on Thursday Day 4), each day's slot tracks **its own independent history week-over-week**.
* **Within the same week:** Both Monday and Thursday share the exact same target RIR (e.g., 3 RIR in Week 1). Thursday does **not** try to beat Monday; Thursday simply aims for 3 RIR.
* **Across weeks:** Week 2 Monday compares against Week 1 Monday. Week 2 Thursday compares against Week 1 Thursday.

When moving to the next week at `weightTargetMin` (same weight as last week):
Because target RIR drops by 1 each week, the lifter is naturally expected to achieve **+1 rep** over what they did in that same session last week:

$$\text{repsTarget}_{\text{Week } N+1} = \text{repsLogged}_{\text{Week } N} + (\text{RIR}_{\text{Week } N} - \text{RIR}_{\text{Week } N+1})$$

* *Example:* If Week 1 Monday at 3 RIR resulted in 10 reps @ 100 lbs, Week 2 Monday at 2 RIR targets **11 reps** @ 100 lbs.
* The UI displays: `"We recommend 11 reps or 2 RIR"`.

#### Overload Evaluation & Performance Badges:
Upon set completion, the frontend evaluates the logged reps against `repsTarget`:
```javascript
if (isNum(set.reps) && set.reps >= 0 && set.repsTarget) {
  if (set.reps > set.repsTarget) performanceLevel = "over";
  else if (set.reps < set.repsTarget) performanceLevel = "under";
  else performanceLevel = "target";
}
```
* **"Improved!"** (`jf.increase`): Logged reps met or exceeded `repsTarget` (progressive overload achieved).
* **"Maintained"** (`jf.maintain`): Matched previous performance without regression.
* **"Regressed"** (`jf.decrease`): Fell below target performance.

---

### C. Weight Progression (Load Overload Track)
Each set provides `weightTargetMin` and `weightTargetMax`:

* **Week 1:** Both are unset (`null`). The UI displays: `"Choose your starting weight"`.
* **Week 2+:** The app displays a recommended weight window:
  ```javascript
  w = weightTargetMin && weightTargetMax
    ? (weightTargetMin === weightTargetMax 
        ? `We recommend ${minWeight} ${unit}` 
        : `We recommend ${minWeight} - ${maxWeight} ${unit}`)
    : (weight ? "No weight recommendation at this time" : "Choose your starting weight");
  ```
  * **`weightTargetMin` (Minimum Weight):** The exact weight completed in the corresponding session last week. Choosing this allows the lifter to progress via **reps** (chasing +1 rep).
  * **`weightTargetMax` (Maximum Weight):** Last week's weight **+ the exact equipment increment from the table below**. Choosing this allows the lifter to progress via **load** (matching last week's reps with heavier weight).

#### Official RP Equipment Increment Table (`Moe` & `Noe`)
The application defines an exact, equipment-aware increment lookup table matching standard gym equipment and plates:

##### 1. When Using Pounds (`lbs`):
| Equipment Type | Weight Range | Increment Step Added |
| :--- | :--- | :--- |
| **Barbell** | 15 lbs – 1,000 lbs | **+5 lbs** *(2.5 lb plate per side)* |
| **Smith Machine** | 20 lbs – 1,000 lbs | **+5 lbs** *(2.5 lb plate per side)* |
| **Dumbbells** | 1 lb – 8 lbs <br> 7.5 lbs – 30 lbs <br> 30 lbs – 205 lbs | **+1 lb** <br> **+2.5 lbs** <br> **+5 lbs** |
| **Machines** | 2.5 lbs – 200 lbs <br> 200 lbs – 1,000 lbs | **+2.5 lbs** <br> **+5 lbs** |
| **Cables / FreeMotion** | 2.5 lbs – 200 lbs <br> 200 lbs – 1,000 lbs | **+2.5 lbs** <br> **+5 lbs** |
| **Weighted Bodyweight** | 0 lbs – 300+ lbs | **+2.5 lbs** |

##### 2. When Using Kilograms (`kg`):
| Equipment Type | Weight Range | Increment Step Added |
| :--- | :--- | :--- |
| **Barbell** | 10 kg – 400+ kg | **+2.5 kg** *(1.25 kg plate per side)* |
| **Smith Machine** | 5 kg – 400+ kg | **+2.5 kg** *(1.25 kg plate per side)* |
| **Dumbbells** | 1 kg – 10 kg <br> 10 kg – 150 kg | **+1 kg** <br> **+2 kg** |
| **Machines** | 5 kg – 600+ kg | **+5 kg** |
| **Cables / FreeMotion** | 2.5 kg – 300+ kg | **+2.5 kg** |
| **Weighted Bodyweight** | 0 kg – 150+ kg | **+2.5 kg** |

#### Special Exercise Type Calculations:
* **Machine Assistance** (e.g., assisted pull-up / dip): Counterweight on the pin reduces bodyweight. Display is transformed:
  $$\text{Display Min} = \text{Bodyweight} - \text{weightTargetMax}$$
  $$\text{Display Max} = \text{Bodyweight} - \text{weightTargetMin}$$
* **Bodyweight Loadable** (e.g., weighted dips / pull-ups): Displayed as added load above bodyweight:
  $$\text{Display Load} = \text{weightTarget} - \text{Bodyweight}$$
* **Bodyweight Only**: Strictly pinned to the user's logged `bodyweight`.

---

### D. What if the Lifter Does Not Have Those Exact Weights?
Gyms vary in available plates and dumbbell jumps (e.g., dumbbells jumping by 10 lbs or 5 kg, or missing fractional plates). The system is built to handle this seamlessly:

1. **Recommendations, Not Restrictions:** The weight input box is completely freeform. Lifters can type any number (e.g., `22.5`, `57.5`, etc.). The client enforces no step restrictions.
2. **Two Practical Overload Strategies:**
   * **Strategy A (Double Progression / Rep Overload):** If the next available weight is too heavy of a jump, stay at **`weightTargetMin`** (last week's weight) and do +1 or +2 reps to hit the target RIR.
   * **Strategy B (Take the Jump & Follow RIR):** If jumping to the next available dumbbell or plate, reps will naturally drop. The lifter stops the set when reaching the week's designated RIR (e.g., 2 RIR).
3. **Automatic System Adaptation:** Whatever weight and rep values the lifter actually records become the baseline for that set next week.

---

### E. Scope of the Three Progression Dimensions

| Progression Dimension | Unit Changed | Scope / Level | Driving Signal |
| :--- | :--- | :--- | :--- |
| **Volume Progression** | Number of **Sets** | **Whole Muscle Group** | Post-workout feedback (`soreness`, `pump`, `workload`, `jointPain`). |
| **Load Progression** | **Weight** (`minWeight` - `maxWeight`) | **Exercise Slot & Set** | Previous week's logged weight + equipment increment table. |
| **Rep Progression** | **Reps Target** | **Exercise Slot & Set** | Previous week's logged reps + weekly drop in RIR. |

---

### F. Target Reps and Weight for Newly Added Sets
When the autoregulation engine or the user adds a set to an exercise:
* The new set **inherits the exact same targets as the existing sets for that exercise in that session** (`weightTargetMin`, `weightTargetMax`, `repsTarget`, and target RIR).
* It does **not** revert to Week 1 baseline. Hypertrophy training operates on straight sets where all sets in an exercise session share the same target intensity.

---

## 7. Incomplete & Skipped Sets

* **Status Flagging:** When a user finishes a workout with unperformed sets (or taps "Skip Sets"), unfinished sets are saved with `status: "skipped"`, `reps: -1`, and `finishedAt: timestamp`.
* **Day Status:** The workout day status is marked as `"partial"` instead of `"complete"`.
* **Exclusion from Volume Totals:** Skipped sets are strictly filtered out of completed volume calculations:
  ```javascript
  completedSets = exercise.sets.filter(set => set.status !== "skipped").length;
  ```
* **Progression Impact:** The post-workout feedback ratings (`pump`, `workload`, `soreness`) reflect only what was completed. The autoregulation engine will **not** add volume on top of an incomplete session; it holds planned volume steady so the lifter can achieve full completion next week.

---

## 8. Editing Past Completed Workouts

* **Allowed for Data Accuracy:** Users can re-open and edit past completed workouts to fix typos or adjust weight/reps.
* **Future Recommendations Locked:** Editing a past completed workout **does not** trigger retroactive recalculation of future weeks.
* **Official Behavior Warning:**
  > *"This workout has already been completed. You can make this change but it won't update any recommendations that have already been made for future workouts."*
* This guarantees plan stability and prevents cascading recalculation errors across upcoming weeks.

---

## 9. Single-Call Workout Completion & Autoregulation

### A. The Single-Call Architecture ("Save Workout")
To ensure network resilience in gym environments with poor connectivity and to prevent partial state updates, the application enforces a **single atomic API request per workout**:
* **Zero Network Calls During Training:** The frontend manages the active workout locally in client memory and auto-persists updates to local storage (`localStorage` / IndexedDB). No per-set, per-rep, or per-exercise network requests are sent during the session.
* **Unified Save Flow:** When the lifter finishes their session and taps **Save Workout**:
  1. A modal / bottom sheet opens prompting the post-workout autoregulation ratings for the specific muscle groups trained in that session.
  2. Upon rating confirmation, the client bundles all logged exercises, sets, notes, and muscle feedback into a single atomic payload.
  3. A single request is dispatched to `POST /api/days/{dayId}/complete`.

### B. Workout Completion Data Contract

**Endpoint:** `POST /api/days/{dayId}/complete`

```json
{
  "dayId": 12,
  "completedAt": "2026-11-01T10:45:00.000Z",
  "exercises": [
    {
      "exerciseId": 101,
      "notes": "Felt good, slight stick point on rep 8 of last set",
      "sets": [
        {
          "setNumber": 1,
          "reps": 12,
          "weight": 100,
          "rir": 3,
          "completed": true,
          "isWarmup": false
        },
        {
          "setNumber": 2,
          "reps": 11,
          "weight": 100,
          "rir": 3,
          "completed": true,
          "isWarmup": false
        },
        {
          "setNumber": 3,
          "reps": 9,
          "weight": 100,
          "rir": 2,
          "completed": true,
          "isWarmup": false
        }
      ]
    }
  ],
  "feedback": [
    {
      "muscleGroupId": 1,
      "soreness": 1,
      "pump": 2,
      "workload": 1,
      "jointPain": 0
    }
  ],
  "sessionNotes": "Trained fasted, hydration was high."
}
```

#### Meaning and Timing of Feedback Dimensions:
* **`soreness` (0–3 | null):** Evaluates recovery **from the PREVIOUS session** that trained this muscle group.
  * **Prompt:** *"How sore did you get in your [muscle group] AFTER training it LAST TIME?"*
  * **Options:** `0` (Never got sore), `1` (Healed early / way before this session), `2` (Healed just on time for this session), `3` (Still sore today).
  * **First Session Rule (N/A):** If this is the **first time** this muscle group is being trained in the mesocycle (e.g., Week 1 Day 1 for Chest), there was no previous session in this block. The UI bypasses soreness, and the payload submits `soreness: null` (or `-1`).
* **`pump` (0–2):** Evaluates the muscle pump achieved in **today's session** (`0`: Low, `1`: Moderate, `2`: Amazing).
* **`workload` (0–3):** Evaluates the session's set volume tolerance in **today's session** (`0`: Not enough, `1`: Just right, `2`: Pushed limits, `3`: Too much).
* **`jointPain` (0–3):** Evaluates joint discomfort experienced during today's session (`0`: None, `1`: Low, `2`: Moderate, `3`: A lot).

### C. Backend Atomic Transaction Lifecycle
When the backend receives the completion payload, it executes the following steps inside a single database transaction:
1. **Status Transition:** Validates the session and transitions the day's status from `pending` / `in_progress` to `completed` (or `"partial"` if any sets were skipped).
2. **Log Persistence:** Saves all actual completed reps, weights, logged RIR, and set completion flags. Uncompleted sets are saved with `status: "skipped"`, `reps: -1`.
3. **Feedback Recording:** Records the `soreness`, `pump`, `workload`, and `jointPain` ratings for each trained muscle group.
4. **Progression & Autoregulation Trigger:** Evaluates the feedback against the decision matrix below and computes the target sets, reps, and weights for the subsequent week's workouts for each involved muscle group.
5. **Future Blueprint Updates:** Mutates the materialized rows of future weeks (`Week N+1` onwards) — set-count cascade and target parameters. See §11.E for the exact cascade rule.
6. **Response:** Returns the saved day record along with updated targets.

### D. Autoregulation Feedback Decision Matrix

Ratings are captured across 4 dimensions per trained muscle group:
1. **`soreness` (0–3):** 0: Never sore, 1: Healed early, 2: Healed just on time, 3: Still sore today.
2. **`pump` (0–2):** 0: Low pump, 1: Moderate pump, 2: Amazing pump.
3. **`workload` (0–3):** 0: Not enough, 1: Just right, 2: Pushed limits, 3: Too much.
4. **`jointPain` (0–3):** 0: None, 1: Low pain, 2: Moderate pain, 3: A lot of pain.

#### Priority-Differentiated Set Progression

The feedback decision matrix applies **differently** depending on a muscle's priority. This is the core mechanism that makes emphasis muscles grow faster and maintain muscles stay flat:

| Priority | Recovery Condition Met | Set Change | Reasoning |
| :--- | :--- | :---: | :--- |
| **Maintain** | *Any feedback* | **+0 always** | Volume is frozen for the entire mesocycle. Maintain muscles never gain or lose sets. All recovery budget is preserved for Grow and Emphasis muscles. |
| **Grow** | Soreness $\le 1$ AND Workload $\le 1$ | **+1 set** | Conservative growth. Only adds volume when fully recovered. Stays near MEV (Minimum Effective Volume). |
| **Grow** | Soreness $= 2$ or Workload $= 2$ | **+0 sets** | At the sweet spot — recovering just in time. Hold steady. |
| **Emphasis** | Soreness $\le 1$ AND Workload $\le 1$ | **+1 to +2 sets** | Aggressive growth. Pushes toward MRV (Maximum Recoverable Volume). Keeps adding sets until feedback shows the lifter is approaching recovery limits. |
| **Emphasis** | Soreness $= 2$ or Workload $= 2$ | **+0 to +1 set** | Near recovery limit but still pushing — may still add 1 set if pump and joint pain allow. |
| *Any* | Soreness $= 3$ (Still sore) | **-1 set** | Over-reached. Reduce volume to allow recovery. |
| *Any* | Workload $= 3$ (Too much) | **-1 set** | Over-reached. Reduce volume. |
| *Any* | Joint Pain $\ge 2$ | **Hold or -1** | Freeze weight. Prompt user to substitute exercise. |

#### How This Creates Diverging Volume Curves

Since emphasis muscles add sets aggressively (+1 to +2 per feedback cycle) and grow muscles add conservatively (+1 only when fully recovered), their weekly volume curves diverge over the mesocycle:

```
Week 1:  Emphasis = 12 sets │ Grow = 6 sets │ Maintain = 4 sets
Week 2:  Emphasis = 14 sets │ Grow = 7 sets │ Maintain = 4 sets
Week 3:  Emphasis = 16 sets │ Grow = 7 sets │ Maintain = 4 sets
Week 4:  Emphasis = 18 sets │ Grow = 8 sets │ Maintain = 4 sets
Deload:  Emphasis = 9 sets  │ Grow = 4 sets │ Maintain = 2 sets
```

* **Maintain** stays flat — it never progresses because the lifter's recovery is being spent on focus muscles.
* **Grow** climbs slowly — only when the body signals it has adapted.
* **Emphasis** climbs aggressively — pushing the envelope each week until soreness or workload signals "enough."

This is how the system drives the lifter's adaptation budget toward priority muscles without burning out systemically.

#### Combined Feedback-to-Action Table (All Priorities)

| Feedback Condition | Set Adjustment for Next Week | Weight & Rep Adjustment |
|---|---|---|
| **Soreness $\le 1$** (Recovered early) + **Workload $\le 1$** + **Pump $\le 1$** | **+1 set** (if Grow)<br>**+1 to +2 sets** (if Emphasize)<br>**+0 sets** (if Maintain) | Progress weight (+2.5–5%) or reps (+1 rep). |
| **Soreness $= 2$** (Recovered on time) + **Workload $= 1$ or $2$** + **Pump $= 2$** | **+0 sets** (Hypertrophy sweet spot: do not add sets) | Progress weight or reps normally. |
| **Soreness $= 3$** (Still sore when training) | **-1 set** (or hold sets) | **Freeze progression.** Hold weight and reps steady. |
| **Workload $= 3$** (Too much volume) | **-1 set** | Hold weight steady. |
| **Joint Pain $\ge 2$** (Moderate / high joint pain) | Hold or decrease sets | **Freeze weight.** Prompt user to substitute exercise. |

---

## 10. Deload Week Logic (Final Week)

The final week of the mesocycle (`weekIndex === length - 1`) is the **Deload (`DL`)**:
1. **50% Set Reduction:** Total sets per exercise are cut in half (e.g., 4 sets drops to 2 sets; 2 sets drops to 1 set).
2. **Intensity Reduction:** Target RIR is relaxed to **4 to 5 RIR** (or weight reduced to ~60–70% of Week 1).
3. **Feedback Suppressed:** Post-workout feedback dialogues are bypassed since no further accumulation week follows.

---

## 11. Read Model & Future-Week Materialization

### A. One Read Endpoint Returns the Whole Tree

`GET /api/mesocycles/:id` returns the entire mesocycle: every week → every day → every exercise → every set. One request. No per-day endpoint. **No computation at read time** — the backend only reads rows.

```json
{
  "id": 1,
  "mesocycleName": "Hypertrophy Block 1",
  "length": 5,
  "unit": "lbs",
  "weeklyRir": [3, 2, 1, 0, 5],
  "sessions": [
    {
      "dayId": 12,
      "weekNumber": 1,
      "dayNumber": 1,
      "label": "Monday",
      "status": "pending",
      "sessionexercise": [
        {
          "exerciseId": 101,
          "notes": null,
          "exercise": { "name": "Bench Press", "muscleGroupId": 1 },
          "set": [
            {
              "setNumber": 1,
              "rirTarget": 3,
              "repsTarget": null,
              "weightTargetMin": null,
              "weightTargetMax": null,
              "weight": null,
              "reps": null,
              "rir": null,
              "status": "pending"
            }
          ]
        }
      ]
    }
  ]
}
```

**Decision (v1): send the Prisma result as-is.** No reshaping helper. Two reasons:

* The backend does not group by week — the calendar groups while rendering, the day view selects one session with a `find` on `weekNumber` + `dayNumber`. Server grouping would duplicate that lookup for a single consumer.
* Field names stay as Prisma returns them (`sessionexercise`, `set`, `exercise.name`). A rename layer is pure translation, and the frontend can read the nested shape directly.

### B. Why the Whole Tree in One Call

* **Size is irrelevant.** 6 weeks × 4 days × 3 exercises × 3 sets ≈ 216 set rows, roughly 20–40 KB. Nobody notices.
* **The calendar drawer needs every week/day anyway** before the user clicks anything. A per-day endpoint would still need a second summary request.
* **One endpoint instead of two**, one cache entry instead of `length × days`.

### C. Frontend Routing

* Mesocycle created → navigate to `/mesocycles/:id/weeks/1/days/1`.
* Calendar cell clicked → navigate to `/mesocycles/:id/weeks/:week/days/:day`.
* The day view is a **lookup inside the cached tree**, not a new request.

### D. Volume Is Materialized, Not Derived

Volume is a per-muscle, per-week integer. It is written into `set` rows at creation and mutated by progression writes afterwards. `GET` never recomputes it. The read path stays dumb; all logic lives on the write paths.

### E. Cascade Rule for Future Weeks

When feedback for muscle group `M` earned on Day position `P` in Week `N` triggers a set volume change Δ (`+1`, `-1`, or `0`):

1. **Target Weeks & Boundaries:** 
   * Apply Δ strictly to **future accumulation weeks (`N+1` through `length - 1`)**. 
   * Current week ($N$) and past weeks ($\le N$) are **never touched mid-week**. Future workouts in the current week remain at their scheduled baseline.
2. **Slot-Based Cascade (Prevents Multi-Session Double-Counting):**
   * If a muscle group is trained multiple times per week (e.g., Session 1 on Monday and Session 2 on Thursday), progression is mapped **slot-to-slot**.
   * Completing Day position `P` applies the Δ adjustment specifically to **Day position `P` in subsequent weeks (`N+1` onwards)**.
   * Completing Monday does **not** alter Thursday of the current week, nor does it double-add to Thursday next week. This guarantees that a `+1` adjustment increases total weekly volume cleanly by exactly 1 set.
3. **Exercise Selection (Which Exercise Gets the Set):**
   * If a session contains multiple exercises for muscle group `M` (e.g., Exercise 1: Bench Press, Exercise 2: Incline Dumbbell Flye):
     * **For additions (`Δ = +1`):** Insert the new set into the **first (primary compound) exercise** for that muscle group in that session. Secondary/isolation exercises retain their baseline set counts.
     * **For reductions (`Δ = -1`):** Remove the last set from the **last (isolation/secondary) exercise** for that muscle group first, preserving primary compound volume.
4. **Target Parameter Inheritance:**
   * A newly inserted set inherits the exact targets of its sibling sets in the same session exercise (`weightTargetMin`, `weightTargetMax`, `repsTarget`, `rirTarget`) — never the Week 1 baseline (§6.D).
5. **Contiguous Set Renumbering:**
   * Renumber `setNumber` on affected exercises to stay contiguous `1..k`.
6. **Deload Week Recalculation:**
   * The final deload week (`weekIndex === length - 1`) is recomputed last, after the accumulation cascade: its set volume is cut by 50% relative to the accumulated value for `M` (rounded down, with a floor of 1 set per exercise), and intensity is relaxed to 4–5 RIR (§10).

### F. Editing Past Workouts — Disabled for v1

Editing a completed workout is turned off for now. `POST /api/days/{dayId}/complete` only ever completes a **pending** day; a second request for the same day is a no-op. §8 stays in the document as future scope.

To enable it later, the status guard in §11.G has to be replaced by a client save token, because the guard cannot tell "retry" from "legitimate correction".

### G. Idempotency — DECIDED: Status Guard

A save request mutates future rows, so a retry must not apply Δ twice. The guard is the day's own status, checked first inside the same transaction:

```ts
const claimed = await tx.session.updateMany({
  where: { id: dayId, status: "pending" },
  data: { status: "completed" }
});
if (claimed.count === 0) return; // already saved — do not cascade again
```

* Zero rows affected → the save already ran → **return the existing day**, do not cascade, do not insert feedback twice.
* No schema change required.
* Cost: an already-completed day can never be corrected (§11.F).

