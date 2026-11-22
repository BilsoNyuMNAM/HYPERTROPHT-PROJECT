import express from "express"
import CountingExercise from "../helper/countingExercise.js";
import VolumeperPriority from "../helper/VolumeperPriority.js"
import setPersession from "../helper/setsPersession.js"
import Transaction from "../services/transaction.js";
import fetchalldata from "../helper/fetchall.js";
import CheckSessionAlready from "../helper/completeSession/check.js";
import { prisma } from "../prisma.js";
import updateTable from "../helper/completeSession/updatetable.js";
import TotalVolume from "../helper/totalVolume/volumepermuscle.js";
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

mesoRoute.get("/:id/volume", async (req, res) => {
    try{
        const volume = await TotalVolume(Number(req.params.id))
        res.status(200).json(volume);
    }
    catch(error){
        console.log("Here is the error:", error)
        res.status(400).json({
            message:"some issues , read the error message:",
            error: error
        });
    }
});

const muscleNames: Record<number, string> = {
    1: "Chest",
    2: "Back",
    3: "Triceps",
    4: "Biceps",
    5: "Shoulders",
    6: "Quads",
    7: "Glutes",
    8: "Hamstrings",
    9: "Calves",
    10: "Traps",
    11: "Forearms",
    12: "Abs",
};

const getFeedbackHandler = async (req: express.Request, res: express.Response) => {
    try {
        const idParam = req.params.id || (req.query.mesocycleId as string) || "12";
        const mesocycleId = Number(idParam);
        if (Number.isNaN(mesocycleId)) {
            return res.status(400).json({ message: "Invalid mesocycle ID" });
        }

        const weekQuery = (req.query.week || req.query.weeknumber) as string | undefined;
        const filterWeek = weekQuery && weekQuery !== "all" && weekQuery !== "" ? Number(weekQuery) : undefined;

        const meso = await prisma.mesocycle.findUnique({
            where: { id: mesocycleId },
            select: { id: true, mesoname: true, length: true }
        });

        if (!meso) {
            return res.status(404).json({ message: `Mesocycle with ID ${mesocycleId} not found` });
        }

        const sessions = await prisma.session.findMany({
            where: { mesocycleId },
            select: { weeknumber: true },
            distinct: ["weeknumber"],
            orderBy: { weeknumber: "asc" }
        });
        const weeks = sessions.length > 0
            ? sessions.map(s => s.weeknumber)
            : Array.from({ length: meso.length }, (_, i) => i + 1);

        const feedbacks = await prisma.feedback.findMany({
            where: {
                whichsession: {
                    mesocycleId,
                    ...(filterWeek !== undefined && !Number.isNaN(filterWeek) ? { weeknumber: filterWeek } : {})
                }
            },
            include: {
                whichsession: {
                    select: {
                        id: true,
                        weeknumber: true,
                        daynumber: true,
                        label: true,
                        status: true
                    }
                }
            },
            orderBy: [
                { whichsession: { weeknumber: "asc" } },
                { whichsession: { daynumber: "asc" } },
                { musclegroupid: "asc" },
                { id: "asc" }
            ]
        });

        const formattedFeedbacks = feedbacks.map(f => ({
            id: f.id,
            sessionId: f.workoutid,
            muscleGroupId: f.musclegroupid,
            muscleName: muscleNames[f.musclegroupid] || `Muscle ${f.musclegroupid}`,
            soreness: f.soreness,
            workload: f.workload,
            pump: f.pump,
            jointpain: f.jointpain,
            weeknumber: f.whichsession.weeknumber,
            daynumber: f.whichsession.daynumber,
            dayLabel: f.whichsession.label || `Day ${f.whichsession.daynumber}`,
            sessionStatus: f.whichsession.status
        }));

        return res.status(200).json({
            mesocycle: meso,
            availableWeeks: weeks,
            selectedWeek: filterWeek ?? "all",
            totalCount: formattedFeedbacks.length,
            feedbacks: formattedFeedbacks
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return res.status(500).json({
            message: "Failed to fetch feedback",
            error: error instanceof Error ? error.message : error
        });
    }
};

mesoRoute.get("/:id/feedback", getFeedbackHandler);
mesoRoute.get("/feedback/:id", getFeedbackHandler);
mesoRoute.get("/feedback", getFeedbackHandler);

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
            await updateTable(tx, sessionId, req.body.sessionexercise, req.body.feedback)
        }, {
            maxWait: 5000,
            timeout: 15000
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