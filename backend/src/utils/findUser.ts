


async function findUser(email:string, prisma:any){
    return await prisma.user.findUnique({
        where:{
            email:email,  
        },
        select:{
                id:true,
                password:true
        }
        
    })
}

export default findUser