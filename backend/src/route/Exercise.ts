import express from "express"
import fetchAllexercise from "../helper/fetchAllexercise.js";
import replaceExercise from "../helper/replaceExercise.js";
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
            error: error
        });
    }
})

export default exerciseRoute