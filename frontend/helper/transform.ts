
//Groups the  list of exercises from the API by muscleGroupId (1–12) , so when user select a dropdown only the matching muscleId index value exercise list is displayed
function transformExerciseresponseShape(exerciseList:{id:number, name:string, muscleGroupId:number}[]){
    //exerciseList = [{}, {}, {}]
    let object = {1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 8:[], 9:[], 10:[], 11:[], 12:[]}
    for(let i=0;i<exerciseList.length; i++){
        const exercise = exerciseList[i]
        object[exercise.muscleGroupId].push(exercise)   
    }
    return object;
}


function buildPriorities(emphasisMuscle, growMuscle, maintainMuscle){
    const priorities = {};

    //final====>{"1":{"muscleGroupId":12 , "priorityType":"grow"}, "2":{}}
  emphasisMuscle.forEach((id)=>{
    priorities[id] = {
      muscleGroupId:id, priorityType:"emphasize"
    }
  })
  growMuscle.forEach((id)=>{
   priorities[id] = {
      muscleGroupId:id, priorityType:"grow"
    }
  })
  maintainMuscle.forEach((id)=>{
    priorities[id] = {
      muscleGroupId:id, priorityType:"maintain"
    }
  })
  return priorities;
  
} 

function buildDays(daysBeforeChange: { day: string; muscles: number[] }[], selectExercise: Record<string, number>) {
    const finalShape: { label: string; exercises: { exerciseId: number; muscleId: number }[] }[] = []

    daysBeforeChange.forEach((dayObject, dayIndex) => {
        const exercises: { exerciseId: number; muscleId: number }[] = []

        dayObject.muscles.forEach((muscleId, slotIndex) => {
            const exerciseId = selectExercise[`${dayIndex}-${slotIndex}`]

            if (exerciseId !== undefined) {
                exercises.push({ exerciseId, muscleId })
            }
        })

        finalShape.push({ label: dayObject.day, exercises })
    })

    return finalShape
}



export {transformExerciseresponseShape,buildPriorities, buildDays}