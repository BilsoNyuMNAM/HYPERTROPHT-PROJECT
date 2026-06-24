

async function findDuplicate(username:string, email:string, prisma:any){
    return await prisma.user.findFirst({
        where:{
            OR:[
                {
                    email: email
                },
                {
                    username:username
                }
            ]
        }
    })
}
export {findDuplicate}