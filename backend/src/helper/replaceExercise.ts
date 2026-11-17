import {prisma} from "../prisma.js"

//swaps exerciseId on every not-yet-completed session from the given position to the end of the mesocycle
function replaceExercise(oldId: number, newId: number, mesocycleId: number, weeknumber: number, daynumber: number){
    return prisma.sessionexercise.updateMany({
        where:{
            exerciseId: oldId,
            whichsession:{
                is:{
                    mesocycleId,
                    status: "pending",
                    OR:[
                        { weeknumber: { gt: weeknumber } }, //later week, day does not matter
                        { weeknumber, daynumber: { gte: daynumber } }, //same week, this day or later
                    ]
                }

            }
        },
        data:{
            exerciseId: newId
        }
    })
}

export default replaceExercise
