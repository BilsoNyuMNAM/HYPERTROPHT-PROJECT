import express from "express"
import fetchAllexercise from "../helper/fetchAllexercise.js";
const exerciseRoute = express();



exerciseRoute.get("/exercises",async (req,res)=>{
    const result = await fetchAllexercise();
    res.json({
        exercises:result
    })
})


export default exerciseRoute