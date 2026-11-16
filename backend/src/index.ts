import express from "express"
import cors from "cors"
import exerciseRoute from "./route/Exercise.js"
import mesoRoute from "./route/Mesocycle.js"
const app = express()
app.use(cors())
app.use(express.json())



app.use("/api/training",exerciseRoute)
app.use("/api/mesocycles", mesoRoute)












app.listen(3000)