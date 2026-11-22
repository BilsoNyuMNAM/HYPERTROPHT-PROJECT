import express from "express"
import { prisma } from "../prisma.js"
import fetchAllexercise from "../helper/fetchAllexercise.js";
import {replaceExercise, deleteRemainingWeeks} from "../helper/replaceExercise.js";
import { repCalculation } from "../helper/algorithm/weigthprogression.js";
import FinddataOflstWk from "../helper/finddataoflastweek.js";
import AddexerciseTosession from "../services/Addexercise.js";
import validateSessionForExercise from "../helper/validateSessionForExercise.js";
const exerciseRoute = express();



exerciseRoute.get("/exercises",async (req,res)=>{
    const result = await fetchAllexercise();
    res.json({
        exercises:result
    })
})

exerciseRoute.post("/replace",async (req,res)=>{
    const { oldId, newId, mesocycleId, weeknumber, daynumber } = req.body
    try{
        const result = await replaceExercise(Number(oldId), Number(newId), Number(mesocycleId), Number(weeknumber), Number(daynumber))
        res.status(200).json({
            message: "exercise replaced for the remaining weeks",
            updated: result.count
        })
    }
    catch(error){
        console.log("Here is the error:", error)
        res.status(400).json({
            message: "some issues , read the error message:",
            error: error // error instanceof Error ? error.message : String(error)
        });
    }
})

exerciseRoute.post("/reps",async (req,res)=>{
    const {weeknumber, daynumber, setNumber, exerciseId, mesocycleId, selectedWeight, targetRir} = req.body
    const lastSet = await FinddataOflstWk(Number(weeknumber), Number(daynumber), Number(setNumber), Number(exerciseId), Number(mesocycleId))

    if(!lastSet || lastSet.weight == null || lastSet.reps == null || lastSet.rir == null){
        return res.json({ reps: null })
    }

    const reps = repCalculation(lastSet.weight, Number(selectedWeight), Number(targetRir), lastSet.reps, lastSet.rir)
    res.json({ reps })
})
exerciseRoute.post("/delete", async (req, res) => {
    const { exerciseId, mesocycleId, weeknumber, daynumber } = req.body
    try {
        const result = await deleteRemainingWeeks(Number(exerciseId), Number(mesocycleId), Number(weeknumber), Number(daynumber))
        res.status(200).json({
            message: "Exercise deleted for the remaining weeks",
            deleted: result.count
        })
    } catch (error) {
        console.log("Here is the error:", error)
        res.status(400).json({
            message: "Failed to delete exercise",
            error: error instanceof Error ? error.message : String(error)
        })
    }
})

exerciseRoute.post("/addexercise", async (req, res) => {
    const { exerciseId, sessionId, rirTarget, mesocycleId, weeknumber, daynumber } = req.body
    if (!exerciseId || !sessionId) {
        return res.status(400).json({
            message: "exerciseId and sessionId are required"
        })
    }
    try {
        const check = await validateSessionForExercise(
            Number(sessionId),
            Number(mesocycleId),
            Number(weeknumber),
            Number(daynumber)
        )
        if (!check.ok) {
            return res.status(check.status).json({
                message: check.message
            })
        }
        await prisma.$transaction(async (tx) => {
            await AddexerciseTosession(
                tx,
                Number(exerciseId),
                Number(sessionId),
                rirTarget != null ? Number(rirTarget) : undefined,
                Number(mesocycleId),
                Number(weeknumber),
                Number(daynumber)
            )
        },{
            maxWait: 10000,
            timeout:120000
        
        })
        res.status(200).json({
            message: "Exercise added successfully"
        })
    } catch (error) {
        console.log("Here is the error:", error)
        res.status(400).json({
            message: "Failed to add exercise",
            error: error instanceof Error ? error.message : String(error)
        })
    }
})

export default exerciseRoute