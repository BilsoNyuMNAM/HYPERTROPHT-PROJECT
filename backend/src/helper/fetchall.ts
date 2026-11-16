import {prisma} from "../prisma.js"

async function fetchalldata(id:number){
    const fetchcomplete = await prisma.mesocycle.findFirst({
        where:{
            id: id,
        },
        include:{
            sessions:{
                include:{
                    sessionexercise:{
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
                            set:true
                        }
                    }
                }
            }
        }

    })
    return fetchcomplete
}

export default fetchalldata
