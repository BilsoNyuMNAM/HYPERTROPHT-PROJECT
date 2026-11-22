import rirSchedule from "../helper/algorithm/rirSchedule.js"

async function Sessiontable(mesoid:number, days:{label:string, exercises:{exerciseId:number, muscleId:number}[]}[], length:number, tx:any, setsPerExercise:any){
    const rirs = rirSchedule(length) //RIR target per week, index = week - 1

    // Step 1: all sessions in one statement
    const sessions = await tx.session.createManyAndReturn({
        data: Array.from({length}, (_, w) => days.map((day, d)=>({
            mesocycleId: mesoid, weeknumber: w+1, daynumber: d+1, label: day.label
        }))).flat()
    })

    // muscleId/week are kept locally; createMany only accepts columns on that table
    const exInput:{workoutid:number, exerciseId:number, muscleId:number, week:number}[] = []
    for(const session of sessions) {
        const day = days[session.daynumber - 1]
        if (!day) continue
        for(const exerciseobject of day.exercises)
            exInput.push({workoutid: session.id, exerciseId: exerciseobject.exerciseId, muscleId: exerciseobject.muscleId, week: session.weeknumber})
    }

    // Step 2: all sessionexercises in one statement
    const sessionExercises = await tx.sessionexercise.createManyAndReturn({
        data: exInput.map(({workoutid, exerciseId})=>({workoutid, exerciseId}))
    })

    // Step 3: all sets in one statement
    //shortcut: pairs returned rows to exInput by index, which relies on Postgres returning INSERT..RETURNING rows in insert order
    const setInput = sessionExercises.flatMap((se: any, k: number)=>{
        const item = exInput[k]
        if (!item) return []
        const {muscleId, week} = item
        const rir = rirs[week - 1]
        return Array.from({length: setsPerExercise[muscleId]}, (_, s)=>({
            sessionexerciseId: se.id, setNumber: s+1, rir, rirTarget: rir
        }))
    })
    await tx.set.createMany({ data: setInput })
}

export {Sessiontable}