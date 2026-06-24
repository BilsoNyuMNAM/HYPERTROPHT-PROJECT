

async function createSession(prisma:any, sessionName:string, weekId:number){
    
    const result = await prisma.session.create({
    data: {
      session_name: sessionName,
      weekId: weekId,
    },
    
    });
    return result;
}
export {createSession}