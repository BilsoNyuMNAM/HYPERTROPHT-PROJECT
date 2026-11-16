
import CalculateNextWeek from "./caculateNextweek.js"
type PayloadSet = {
    id:number,
    setnumber:number,
    reps: string
    weight: string
    rir: number | null
    repsTarget:number, 
    rirTarget:number, 
    status: string,
    sessionexerciseId:number
    
}

type PayloadExercise = {
    id:number,
    exerciseId: number,
    notes?: string | null,
    workoutId:number, 
    exercise:{name:string, muscleGroupId:number},
    set: PayloadSet[]
    feedback?:{muscleId:number, soreness:number, pump:number, workload:number} // a muscle = a feedback , if there is more than one exercise of the muscle , only one get the feedback key , so this is optional
}

type PayloadFeedback = {
    muscleId: number,
    soreness: number, // -1 = first time training this muscle, nothing to rate
    pump: number,
    workload: number
}



export default async function updateTable(tx:any, dayId:number, sessionexercise:PayloadExercise[], feedback?:PayloadFeedback[]){
    const rep: Record<number, number[]> = {}
    const lastweight: Record<number, number[]> = {}

    for (const payloadExercise of sessionexercise){ //for each payloadExercise in exerciseobject 
        const sessionexercise = await tx.sessionexercise.findFirst({
            where:{ workoutid: dayId, exerciseId: payloadExercise.exerciseId }
        })

        if(!sessionexercise){ //if there is no row with [workoutid: dayId, exerciseId: payloadExercise.exerciseId]
            throw new Error(`exercise ${payloadExercise.exerciseId} is not part of day ${dayId}`)
        }

        if(payloadExercise.notes !== undefined){ //if the payload have notes , then execute this 
            await tx.sessionexercise.update({
                where:{ id: sessionexercise.id },
                data:{ notes: payloadExercise.notes }
            })
        }

        
        rep[payloadExercise.exerciseId] = []
        
        lastweight[payloadExercise.exerciseId] = []

        const sets = payloadExercise.set

        for (let i=0; i<sets.length; i++){
            const set = sets[i]
            if (!set) continue
            const data = {
                weight: Number(set.weight) || 0,
                reps: set.status == "completed" ? (Math.round(Number(set.reps)) || 0) : -1,
                rir: set.status == "completed" ? (set.rir != null ? Number(set.rir) : null) : null,
                status: set.status == "completed" ? "completed" : "skipped"
            }
            rep[payloadExercise.exerciseId]?.push(set.status == "completed" ? Number(set.reps) : -1)
            lastweight[payloadExercise.exerciseId]?.push(Number(set.weight))
            await tx.set.upsert({
                where:{ sessionexerciseId_setNumber:{ sessionexerciseId: sessionexercise.id, setNumber: i+1 } },
                update: data,
                create: { ...data, sessionexerciseId: sessionexercise.id, setNumber: i+1 }
            })
        }

        //rows the user deleted in the app
        await tx.set.deleteMany({
            where:{ sessionexerciseId: sessionexercise.id, setNumber:{ gt: sets.length } }
        })
    }

   


    
    if (feedback?.length){
        await tx.feedback.deleteMany({ where: { workoutid: dayId } }) // retry-safe: clear old rows before writing
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

    await tx.session.update({
        where:{
            id:dayId
        },
        data:{
            status: "completed"
        }
    })
    await CalculateNextWeek(dayId, rep, lastweight, tx)
}
