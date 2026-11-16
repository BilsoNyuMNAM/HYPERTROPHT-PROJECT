import express from "express"
import CountingExercise from "../helper/countingExercise.js";
import VolumeperPriority from "../helper/VolumeperPriority.js"
import setPersession from "../helper/setsPersession.js"
import Transaction from "../services/transaction.js";
import fetchalldata from "../helper/fetchall.js";
import CheckSessionAlready from "../helper/completeSession/check.js";
import { prisma } from "../prisma.js";
import updateTable from "../helper/completeSession/updatetable.js";
const mesoRoute = express();


mesoRoute.post("/create", async (req, res) => {
    const body = req.body
    const exerciseCountPerMuscle = CountingExercise(body.days)
    const volumePerweek = VolumeperPriority(body.priorities)
    const setsPerExercise = setPersession(exerciseCountPerMuscle, volumePerweek)
    

    try{
        const mesocycleId = await Transaction(body.mesocyclename, body.length, body,setsPerExercise)
        res.status(200).json({
            message:"all the weeks and their corresponding datas has been created",
            id: mesocycleId
        });
    }
    catch(error){
        console.log("Here is the error:", error)
        res.status(400).json({
            message:"some issues , read the error message:",
            error: error
        });
    }

    
});

mesoRoute.get("/all/:id", async (req, res) => {
    try{
        const data = await fetchalldata(Number(req.params.id))
        res.status(200).json(data);
    }
    catch(error){
        console.log("Here is the error:", error)
        res.status(400).json({
            message:"some issues , read the error message:",
            error: error
        });
    }
});

mesoRoute.post("/", async (req, res) => {
    
    res.status(200).json({
       
    });
});

mesoRoute.post("/complete", async(req, res)=>{ //complete workout  route 
    const sessionId = req.body.id ?? req.body.dayId
    const result = await CheckSessionAlready(sessionId) //checking if the data already exist in the database before doing any database operation
    if(result == null){ //session does not exist 
        return res.status(404).json({
            message: "Session does not exist",
        })
    }
    //if (true) => returns a message 
    if(result){
        return res.status(409).json({
            message:"Session already completed in the database"
        })
    }
    //if false => save workout in transaction
    try {
        await prisma.$transaction(async (tx)=>{
            await updateTable(tx, sessionId, req.body.exercises, req.body.feedback)
        })
        return res.status(200).json({
            message: "Session completed successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to complete session",
            error: error instanceof Error ? error.message : error
        })
    }
})


export default mesoRoute