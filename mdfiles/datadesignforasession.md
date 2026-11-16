## Session Data Capture — Decisions So Far

### 1. Read path (already works, do not change behaviour)
- One call returns the whole tree: `GET /api/mesocycles/all/:id`. No per-day fetch.
- Entering a session is a lookup inside that cached tree:
  `data.sessions.find(s => s.weeknumber === week && s.daynumber === day)`.
- Cached in `data` (from `useState`). Never refetched when opening a session.

### 2. Identity (closed)
- **Card = `sessionexercise.id`** (e.g. `93`). Unique even if the same `exerciseId`
  appears twice in one session (two-a-day / same muscle twice).
- **Row = `set.id`** (already returned by `set: true`), with `setNumber` as display order.
- **Session = `workoutid`** on the card (equals `session.id`).
- Rule: never key or update by array index. `key={set.id}`, never `key={index}`.
- If `fetchall.ts` is ever switched from `include` to `select`, it must keep `id: true`.

### 3. Ownership
- Only `WorkoutUi` owns the whole day. `Setcard` owns nothing.
- Extract to `frontend/helper/useWorkoutDay(weeknumber, daynumber)`:
  fetch + loading + `currentSession` + day state + all set mutations.
- `WorkoutUi.tsx` becomes render-only. No reducer, no context (actions only ever
  touch the card they were called on).
- Why a hook, not a component-level state: add / remove / skip / replace all need the
  same day state, and the payload is built once from it.

### 4. Day state
- Created after the fetch resolves, as a **copy** of `currentSession`
  (so typing never mutates the cached `data`).
- Shape = the session shape it came from: `label`, `status`, `workoutid`,
  `sessionexercise[] → { id, exerciseId, notes, exercise, set[] }`.
- It is the payload source. Nothing else.

### 5. Mutations (plain `useState`, named functions on the hook)
All are local to one card, addressed by `sessionexercise.id`:
- `updateSet(cardId, setId, field, value)` — field is `weight` / `reps` / `logged`
- `addSet(cardId)` — new set inherits the card's sibling targets (see §6.D)
- `removeSet(cardId, setId)`
- `skipSet(cardId, setId)` — status `skipped`, reps `-1`
- `replaceExercise(cardId, newExerciseId)` — swaps only that card

### 6. Typing rules
- Keep `weight` / `reps` as **strings** while the user types (`""`, `"10."`, `"100"`).
- Convert to numbers only when building the payload.
- `logged` is a boolean on the set, not part of the payload.

### 7. Payload (per §9.B of the architecture doc)
Built from day state on Save: `workoutid`, `completedAt`, `exercises[]`
(with `sessionexerciseId`, `exerciseId`, `notes`, `sets[]`), `feedback[]`,
`sessionNotes`. Sets send `sessionexerciseId` too — that is what makes two
Bench Press cards distinguishable.

### Open / not decided yet
- Exact signature of `updateSet` (single call vs per-field calls).
- Where `feedback` ratings are collected (they are not part of the day state yet).
- The Save request itself (`POST /api/days/{dayId}/complete`) and the backend side.
- Persistence during the session (localStorage) — explicitly out of scope for now.