
//this function returns the baseline sets per exercise slot for Week 1 (MEV baseline)
//Volume emerges from (exercise slots × baseline sets), not from dividing a weekly target.
//
// Maintain = 2 sets per exercise slot (preserve muscle, minimal fatigue)
// Grow     = 3 sets per exercise slot (minimum effective volume)
// Emphasis = 3 sets per exercise slot (more volume comes from more slots, not more sets per slot)

function VolumeperPriority(priorities:Record<string , Record<string , string|number >>){
    const setsPerExerciseSlot:Record<number, number> = {}
    Object.keys(priorities).forEach(key=>{
        const priority = priorities[key]?.priorityType
        if(priority === "maintain"){
            setsPerExerciseSlot[Number(key)] = 2
        }
        else{
            // both "grow" and "emphasize" start at 3 sets per exercise slot
            // emphasis gets higher weekly volume through more exercise slots (Table 2),
            // not through more sets per individual slot
            setsPerExerciseSlot[Number(key)] = 3
        }
    })
    return setsPerExerciseSlot

}

export default VolumeperPriority