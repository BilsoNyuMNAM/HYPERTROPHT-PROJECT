# Workout UI Data Flow & State Shapes

## Overview

1. **Fetch & Cache**: `WorkoutUi.tsx` fetches the complete mesocycle data tree (`GET http://localhost:3000/api/mesocycles/all/:id`) on mount and stores it in `data`.
2. **Current Session Lookup**: Reads `weeknumber` and `daynumber` from URL route params (`useParams()`) and matches against `data.sessions`:
   ```ts
   const currentSession = data?.sessions?.find(
       (element: any) => element.weeknumber == weeknumber && element.daynumber == daynumber
   );
   ```
3. **Session Data Deep Copy**: Passes `currentSession` to `copySessionData(currentSession)` to create an isolated, deep-cloned copy (deeply copying `sessionexercise` and its inner `set` arrays).
4. **State Storage**: The copied session is stored in state (`sessionData`) via `setSessiondata(copySessionData(currentSession))` (using the `useWorkoutDay` hook) so that user input changes do not mutate the cached API data.
5. **Card & Set Rendering**: Maps through `sessionData.sessionexercise`:
   ```tsx
   {sessionData.sessionexercise.map((exerciseobject: any, index: number) => (
       <Setcard key={index} exerciseData={exerciseobject} />
   ))}
   ```
   Each `Setcard` renders the exercise name (`exerciseobject.exercise.name`), targeted muscle group (`exerciseobject.exercise.muscleGroupId`), and maps over `exerciseobject.set` to render rows of individual sets.

---

## 1. `currentSession` Shape

The `currentSession` object is the raw session data found in `data.sessions` (from backend `prisma.mesocycle.findFirst` with `sessions.include.sessionexercise.select...`).

```json
{
  "id": 18,
  "mesocycleId": 1,
  "weeknumber": 1,
  "daynumber": 1,
  "label": "Chest & Triceps",
  "status": "pending",
  "sessionexercise": [
    {
      "id": 93,
      "exerciseId": 12, 
      "workoutid": 18,
      "notes": "Keep shoulders retracted",
      "exercise": {
        "muscleGroupId": 1,
        "name": "Incline Dumbbell Press"
      },
      "set": [
        {
          "id": 665,
          "setNumber": 1,
          "weight": null,
          "reps": null,
          "rir": null,
          "weightTargetMin": 24.0,
          "weightTargetMax": 28.0,
          "repsTarget": 10,
          "status": "pending",
          "sessionexerciseId": 93
        },
        {
          "id": 666,
          "setNumber": 2,
          "weight": null,
          "reps": null,
          "rir": null,
          "weightTargetMin": 24.0,
          "weightTargetMax": 28.0,
          "repsTarget": 10,
          "status": "pending",
          "sessionexerciseId": 93
        }
      ]
    },
    {
      "id": 94,
      "exerciseId": 25,
      "workoutid": 18,
      "notes": null,
      "exercise": {
        "muscleGroupId": 3,
        "name": "Triceps Pushdown"
      },
      "set": [
        {
          "id": 667,
          "setNumber": 1,
          "weight": null,
          "reps": null,
          "rir": null,
          "weightTargetMin": 15.0,
          "weightTargetMax": 20.0,
          "repsTarget": 12,
          "status": "pending",
          "sessionexerciseId": 94
        }
      ]
    }
  ]
}
```

### `currentSession` Fields Description:
- `id` *(number)*: Unique ID of the session (`session.id`), also referred to as `workoutid`.
- `mesocycleId` *(number)*: ID of the parent mesocycle.
- `weeknumber` *(number)*: The week number (1, 2, 3...) matched against route params.
- `daynumber` *(number)*: The day number (1, 2, 3...) matched against route params.
- `label` *(string | null)*: Optional session label / title (e.g., "Upper Body A").
- `status` *(string)*: Session status (`"pending"`, `"complete"`, `"skipped"`).
- `sessionexercise` *(array)*: Array of exercises programmed for this session:
  - `id` *(number)*: Primary key of this `sessionexercise` record (distinguishes duplicate exercises in the same session).
  - `exerciseId` *(number)*: ID of the exercise in the global exercise library.
  - `workoutid` *(number)*: References parent `session.id`.
  - `notes` *(string | null)*: User notes specific to this exercise session.
  - `exercise` *(object)*: Details from the exercise table:
    - `muscleGroupId` *(number)*: ID of the muscle group (e.g. 1 for Chest, 3 for Triceps).
    - `name` *(string)*: Display name of the exercise.
  - `set` *(array)*: List of programmed sets for this exercise.

---

## 2. `sessionData` Shape

`sessionData` is created by passing `currentSession` through `copySessionData(currentSession)`:
```ts
export default function copySessionData(sessiondata: any) {
    return {
        ...sessiondata,
        sessionexercise: sessiondata.sessionexercise.map((element: any) => ({
            ...element,
            set: element.set.map((eachset: any) => ({ ...eachset })),
        })),
    }
}
```

### Shape & Lifecycle:
- **Structural identity**: Its shape matches `currentSession`, but all nested arrays and objects (`sessionexercise` and `set`) are brand-new object references in memory.
- **Working state**: Acts as the reactive local state of the current workout day managed by `useWorkoutDay`.
- **In-flight mutations**: As the user types into `<Setcard>` weight/reps inputs or clicks the log checkbox, updates are applied directly to `sessionData` (without mutating `data` from the initial fetch).

### Example of `sessionData` with Active User Logging:
```json
{
  "id": 18,
  "mesocycleId": 1,
  "weeknumber": 1,
  "daynumber": 1,
  "label": "Chest & Triceps",
  "status": "pending",
  "sessionexercise": [
    {
      "id": 93,
      "exerciseId": 12,
      "workoutid": 18,
      "notes": "Keep shoulders retracted",
      "exercise": {
        "muscleGroupId": 1,
        "name": "Incline Dumbbell Press"
      },
      "set": [
        {
          "id": 665,
          "setNumber": 1,
          "weight": 26.0,
          "reps": 10,
          "rir": 3,
          "weightTargetMin": 24.0,
          "weightTargetMax": 28.0,
          "repsTarget": 10,
          "status": "complete",
          "sessionexerciseId": 93
        },
        {
          "id": 666,
          "setNumber": 2,
          "weight": null,
          "reps": null,
          "rir": null,
          "weightTargetMin": 24.0,
          "weightTargetMax": 28.0,
          "repsTarget": 10,
          "status": "pending",
          "sessionexerciseId": 93
        }
      ]
    }
  ]
}
```

---

