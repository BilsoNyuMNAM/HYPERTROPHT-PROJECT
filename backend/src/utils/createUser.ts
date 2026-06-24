
async function createUser(name:string, email:string, hashedPassword:string, prisma:any){
    return await prisma.user.create({
                data:{
                    email: email,
                    username: name,
                    password: hashedPassword
                }
})
}
export {createUser}