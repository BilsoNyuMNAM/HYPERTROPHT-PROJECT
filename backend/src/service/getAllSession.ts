



async function getAllSession(weekId:number, prisma:any){
    const sessions = {
        sessions: await prisma.session.findMany({
          where: {
            weekId: weekId,
            deletedAt: null,
    
          },
          select: {
            id: true,
            session_name: true,
            exerciselogs: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                exerciseId: true,
                set: {
                  where: {
                    deletedAt: null,
                  },
                  select: {
                    id: true,
                    reps: true,
                    weight: true,
                    rir: true,
                  },
                },
              },
            },
          },
        }),
      };
    return sessions
}

export {getAllSession}