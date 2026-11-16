import {prisma} from "../prisma.js"
import saveTomesocycleTable from "../services/mesocycletable.js"
import { Sessiontable } from "./sessiontable.js"
async function Transaction(mesocyclename:string, length:number, body:any, setsPerExercise:any){
   
    try{
        return await prisma.$transaction(async (tx)=>{
            const result = await saveTomesocycleTable(tx, mesocyclename, length)
            await Sessiontable(result.id, body.days, length, tx, setsPerExercise)
            return result.id
        },{
            maxWait: 10000,
            timeout:120000
        })
    }
    catch(error){
        throw error 
    }
    
}

export default Transaction