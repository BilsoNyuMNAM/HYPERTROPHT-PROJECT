import {prisma} from "../prisma.js"


//this function insert the name and length coming from the payload to the database
async function saveTomesocycleTable(tx:any,mesocyclename:string, length:number){
    console.log("trasaction called the saveTomesocycle function")
    try{
        const result = await tx.mesocycle.create({
        data:{
            mesoname:mesocyclename,
            length:length
        }
        })
        console.log("mesocycle table created")
        return result;
    }
    catch(error){
        throw error
    }
    
    //result = {mesoname: " ", length: }
    
    
}

export default  saveTomesocycleTable