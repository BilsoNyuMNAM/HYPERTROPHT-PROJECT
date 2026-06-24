

async function Allmesocycle(prisma:any,userId:any ) {
    const searchResult = await prisma.mesocycle.findMany({
                where: {
                    deletedAt: null,
                    userId: userId.userID
                },
                select:{
                    id:true,
                    name:true,
                    week: {
                        where: {
                            deletedAt: null,
                        },
                        select: {
                            week_name: true,
                            _count: {
                                select: {
                                    session: {
                                        where: {
                                            deletedAt: null,
                                        },
                                    },
                                    startingvolume: {
                                        where: {
                                            deletedAt: null,
                                        },
                                    },
                                }
                            }
                        }
                        
                    },
                }
            })
    return searchResult
}

export {Allmesocycle}