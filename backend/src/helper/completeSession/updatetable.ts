
import CalculateNextWeek from "./caculateNextweek.js"

type PayloadSet = {
    id: number
    setNumber: number
    reps: string
    weight: string
    rir: number | null
    repsTarget?: number | null
    rirTarget?: number | null
    status: string
    sessionexerciseId: number
}

type PayloadExercise = {
    id: number
    exerciseId: number
    notes?: string | null
    workoutId: number
    exercise: { name: string; muscleGroupId: number }
    set: PayloadSet[]
    feedback?: { muscleId: number; soreness: number; pump: number; workload: number }
}

type PayloadFeedback = {
    muscleId: number
    soreness: number // -1 = first time training this muscle, nothing to rate
    pump: number
    workload: number
}

export default async function updateTable(
    tx: any,
    dayId: number,
    sessionexercise: PayloadExercise[],
    feedback?: PayloadFeedback[]
) {
    const rep: Record<number, number[]> = {}
    const lastweight: Record<number, number[]> = {}

    // 1. Fetch all existing sessionexercises for this day in 1 single query
    const dbExercises = await tx.sessionexercise.findMany({
        where: { workoutid: dayId }
    })
    const dbExerciseMap = new Map(dbExercises.map((e: any) => [e.id, e]))

    // 2. Delete all old sets for this session in 1 single query
    const exerciseRowIds = dbExercises.map((e: any) => e.id)
    if (exerciseRowIds.length > 0) {
    await tx.set.deleteMany({
            where: { sessionexerciseId: { in: exerciseRowIds } }
    })
    }

    // 3. Prepare sets and exercise updates in memory
    const allSetsToCreate: any[] = []
    const exerciseUpdates: Promise<any>[] = []

    for (const payloadExercise of sessionexercise) {
        const dbExercise: any = dbExerciseMap.get(payloadExercise.id)
        if (!dbExercise) {
            throw new Error(`Exercise record ${payloadExercise.id} is not part of day ${dayId}`)
        }
        
        // Persist swapped exerciseId or notes if changed
        const dataToUpdate: any = {}
        if (dbExercise.exerciseId !== payloadExercise.exerciseId) {
            dataToUpdate.exerciseId = payloadExercise.exerciseId
        }
        if (payloadExercise.notes !== undefined && payloadExercise.notes !== dbExercise.notes) {
            dataToUpdate.notes = payloadExercise.notes
        }
        if (Object.keys(dataToUpdate).length > 0) {
            exerciseUpdates.push(
                tx.sessionexercise.update({
                    where: { id: payloadExercise.id },
                    data: dataToUpdate
            })
            )
        }
        
        rep[payloadExercise.exerciseId] = []
        lastweight[payloadExercise.exerciseId] = []

        const sets = payloadExercise.set || []
        for (let i = 0; i < sets.length; i++) {
            const set = sets[i]
            if (!set) continue

            const isCompleted = set.status === "completed"
            const weightVal = Number(set.weight) || 0
            const repsVal = isCompleted ? (Math.round(Number(set.reps)) || 0) : -1
            const rirVal = isCompleted ? (set.rir != null ? Number(set.rir) : null) : null

            rep[payloadExercise.exerciseId]!.push(isCompleted ? Number(set.reps) : -1)
            lastweight[payloadExercise.exerciseId]!.push(weightVal)

            allSetsToCreate.push({
                sessionexerciseId: payloadExercise.id,
                setNumber: i + 1,
                weight: weightVal,
                reps: repsVal,
                rir: rirVal,
                repsTarget: set.repsTarget ?? null,
                rirTarget: set.rirTarget ?? null,
                status: isCompleted ? "completed" : "skipped"
            })
        }
        }

    // Run exercise updates in parallel if any
    if (exerciseUpdates.length > 0) {
        await Promise.all(exerciseUpdates)
    }

    // 4. Insert all sets for the entire workout in 1 single bulk query
    if (allSetsToCreate.length > 0) {
        await tx.set.createMany({
            data: allSetsToCreate
        })
    }

    // 5. Update feedback
    if (feedback?.length) {
        await tx.feedback.deleteMany({ where: { workoutid: dayId } })
        await tx.feedback.createMany({
            data: feedback.map(f => ({
                workoutid: dayId,
                musclegroupid: f.muscleId,
                soreness: f.soreness,
                pump: f.pump,
                workload: f.workload,
                jointpain: 0
            }))
        })
    }

    // 6. Mark session completed
    await tx.session.update({
        where: { id: dayId },
        data: { status: "completed" }
    })

    // 7. Calculate next week progression
    await CalculateNextWeek(dayId, rep, lastweight, tx)
}
