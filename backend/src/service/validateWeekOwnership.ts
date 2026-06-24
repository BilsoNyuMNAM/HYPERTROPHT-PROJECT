


async function validateWeekOwnership(weekId:number, userId:any, prisma:any){
    const weekResult = await prisma.week.findFirst({
        where:{
        id: weekId,
        deletedAt: null,
        mesocycle:{
            deletedAt: null,
            userId: userId.userID
        },
        },
        select: {
            completed: true,
        },
  })
  return weekResult
}

export {validateWeekOwnership}