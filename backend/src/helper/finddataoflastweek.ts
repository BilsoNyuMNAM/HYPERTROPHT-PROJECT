import {prisma} from "../prisma.js"

export default async function FinddataOflstWk(weeknumber:number, daynumber:number, setnumber:number, exerciseId:number,mesocycleId:number){
    const lastweek = weeknumber-1;
    const lastday = daynumber
    const lastweekrow = await prisma.session.findFirst({
        where:{
            AND:[{weeknumber:lastweek},{daynumber:lastday},{mesocycleId:mesocycleId}],
            sessionexercise:{
                some:{
                    exerciseId:exerciseId,
                    set: { some: { setNumber: setnumber } }
                }
                
            }
        },
        include:{
            sessionexercise:{
                where:{ exerciseId: exerciseId }, //without this [0] is another exercise of the day
                include:{ set:{ where:{ setNumber: setnumber } } }
            }
        }
    })
    return lastweekrow?.sessionexercise[0]?.set[0] ?? null
}