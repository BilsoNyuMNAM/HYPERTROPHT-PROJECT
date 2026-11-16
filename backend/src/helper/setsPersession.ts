//Returns the baseline sets per exercise for Week 1.
//
// Since VolumeperPriority now returns sets-per-exercise-slot directly (2 for maintain,
// 3 for grow/emphasis), this function simply passes those values through keyed by muscleId.
// The old division (weeklyVolume / exerciseCount) is removed — RP's approach is:
//   weekly volume = exercise slots × baseline sets per slot
// NOT:
//   sets per slot = weekly volume ÷ exercise slots
//
function setPersession(exerciseCountPerMuscle: Record<number, number>, setsPerExerciseSlot:Record<number, number>): Record<number, number>{
    const setsPersession:Record<number, number>={}
    for(let i=1;i<=12; i++){
        // Use the baseline from VolumeperPriority directly; default to 3 if muscle
        // is somehow missing (shouldn't happen, but safe fallback)
        setsPersession[i] = setsPerExerciseSlot[i] ?? 3
    }
    return setsPersession

}
export default setPersession