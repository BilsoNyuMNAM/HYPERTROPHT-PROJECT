//count the number of exercise for each muscle
function CountingExercise(days:{label:string, exercises:{exerciseId:number, muscleId:number}[]}[]){
    const count:Record<number, number> = {}
    days.forEach(element=>{
        element.exercises.forEach(element=>{
            if (Object.hasOwn(count, element.muscleId)){
                //@ts-ignore
                count[element.muscleId]++
            }
            else{
                count[element.muscleId] = 1
            }
        })
    })
    return count
}

export default CountingExercise