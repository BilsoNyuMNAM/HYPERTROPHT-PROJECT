


//this function calcaulte the rep progression for next week same session

import Repprogression from "../algorithm/repprogression.js"

export default async function CalculateNextWeek(
    dayId: number,
    rep: Record<number, number[]>,
    lastweight: Record<number, number[]>,
    tx: any
) {
    try {
        // 1. Fetch current session with its mesocycle and sets
        const currentSession = await tx.session.findUnique({
            where: { id: dayId },
            include: {
                mesocycle: true,
                sessionexercise: {
                    include: {
                        set: true
                    }
                }
            }
        })

        if (!currentSession) return

        const nextweek = currentSession.weeknumber + 1

        // If next week is deload week (length) or beyond, skip progression
        if (nextweek >= currentSession.mesocycle.length) return

        // 2. Fetch the matching session for next week
        const nextSession = await tx.session.findFirst({
            where: {
                mesocycleId: currentSession.mesocycleId,
                weeknumber: nextweek,
                daynumber: currentSession.daynumber
            },
            include: {
                sessionexercise: {
                    include: {
                        set: true
                    }
                }
            }
        })

        if (!nextSession) return

        // Target RIR of current week
        const currentRir = currentSession.sessionexercise[0]?.set[0]?.rirTarget

        // 3. Update next week's sets exercise by exercise
        for (const nextExercise of nextSession.sessionexercise) {
            const exerciseReps = rep[nextExercise.exerciseId] || [] //get the reps array
            const exerciseWeights = lastweight[nextExercise.exerciseId] || [] //get the weight array


                /*
                    FOR EACH set:
    
                        1. DECIDE REPS:
                        IF lastRep is missing OR set was skipped (-1):
                            nextReps = -1
                        
                        ELSE IF both currentRIR and nextRIR exist:
                            IF currentRIR is EQUAL to nextRIR:
                                nextReps = lastRep  // keep same reps
                            ELSE:
                                nextReps = Repprogression(lastRep, currentRIR, nextRIR)  // add rep progression

                        2. UPDATE DATABASE:
                        UPDATE this set:
                            reps   = nextReps
                            weight = lastWeight  // keep same weight
                */
            for (const nextSet of nextExercise.set) { //each set of the exercise 
                const setIndex = nextSet.setNumber - 1
                const lastRep = exerciseReps[setIndex]
                const lastWeight = exerciseWeights[setIndex]

                if (lastRep === undefined && lastWeight === undefined) {
                    continue
                }

                let nextReps: number | null = lastRep ?? null

                // If set was skipped (-1) or missing
                if (lastRep === -1 || lastRep === null || lastRep === undefined) {
                    nextReps = -1
                } else if (
                    currentRir !== null &&
                    currentRir !== undefined &&
                    nextSet.rirTarget !== null &&
                    nextSet.rirTarget !== undefined
                ) {
                    if (currentRir === nextSet.rirTarget) {
                        nextReps = lastRep
                    } else {
                        nextReps = Repprogression(lastRep, currentRir, nextSet.rirTarget)
                    }
                }

                await tx.set.update({
                    where: { id: nextSet.id },
                    data: {
                        reps: nextReps,
                        weight: lastWeight ?? null
                    }
                })
            }
        }
    } catch (error) {
        console.error("Error calculating next week progression:", error)
        throw error
    }
}
