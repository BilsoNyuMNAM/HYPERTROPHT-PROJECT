import {prisma} from "../prisma.js"

async function fetchalldata(id:number){
    const fetchcomplete = await prisma.mesocycle.findFirst({
        where:{
            id: id,
        },
        include:{
            sessions:{
                orderBy: [
                    { weeknumber: "asc" },
                    { daynumber: "asc" }
                ],
                include:{
                    sessionexercise:{
                        // rows are rewritten by updates, so physical order is not stable
                        orderBy: { id: "asc" },
                        select:{
                            id:true,
                             exerciseId:true,
                             workoutid:true,
                             notes:true,
                                exercise:{
                                    select:{
                                        muscleGroupId:true,
                                        name:true
                                    }
                            },
                            // without this, Postgres returns sets in heap order, not setNumber order
                            set: { orderBy: { setNumber: "asc" } }
                        }
                    }
                }
            }
        }

    })
    return fetchcomplete
}

export default fetchalldata
