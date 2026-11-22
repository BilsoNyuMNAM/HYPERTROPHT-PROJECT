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
async function deleteRemainingWeeks(exerciseId: number, mesocycleId: number, weeknumber: number, daynumber: number){
    
    await prisma.set.deleteMany({
        where: {
            whichsessionexercise: {
                exerciseId: exerciseId,
                whichsession: {
                    mesocycleId: mesocycleId,
                    status: "pending",
                    OR: [
                        { weeknumber: { gt: weeknumber } },
                        { weeknumber, daynumber: { gte: daynumber } },
                    ]
                }
            }
        }
    })

    // delete sessionexercise
    const result = await prisma.sessionexercise.deleteMany({
        where: {
            exerciseId: exerciseId,
            whichsession: {
                mesocycleId: mesocycleId,
                status: "pending",
                OR: [
                    { weeknumber: { gt: weeknumber } },
                    { weeknumber, daynumber: { gte: daynumber } },
                ]
            }
        }
    })

    return result
}
export {replaceExercise, deleteRemainingWeeks}
