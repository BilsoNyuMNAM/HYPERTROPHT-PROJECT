import {prisma} from "../../prisma.js"
//3 condition : pending, complete, not exist , [false, true, null]

async function CheckSessionAlready(sessionId:number){ 
   if (!sessionId) return null
   const result = await prisma.session.findFirst({
    where:{
        id: sessionId
    }
   })
   if(result){
     if(result.status == "pending") return false // if the status of the row is pending than it does not exist 
     else{
        return true  // if status is compete then the session already exist 
     }
   }
   //if result does not exist 
   return null

}

export default CheckSessionAlready