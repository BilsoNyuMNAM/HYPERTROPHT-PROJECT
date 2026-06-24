
import { Hono } from "hono";
import { getPrismaClient } from "../../../lib/prismaClient";
import { frequency } from "./Frequency/frequency";
import { week } from "./Week/week";
import { volume } from "./Week/Volume/volume";
import { validateMesocycleInput } from "../../utils/inputValidation";
import { softDeleteMesocycle } from "../../service/mesocycleService";
import { authMiddleware } from "../../utils/authMiddleware";
import { Allmesocycle } from "../../service/Allmesocycle";
import { getMesocycleById } from "../../service/getMesocycleById";
import { getWeeksWithUnlockStatus } from "../../service/getWeeksWithUnlockStatus";
import { getTotalSessionCount } from "../../service/getTotalSessionCount";
const cycle = new Hono<{ Bindings: { DATABASE_URL: string; JWT_TOKEN: string }; Variables: { userId: any } }>();

type WeekRow = {
    id: number
    week_name: string
}

function parseWeekNumber(weekName: string): number {
    const weekNumber = Number(weekName.replace(/\D/g, ""))
    return Number.isFinite(weekNumber) ? weekNumber : 0
}

export function isWeekUnlocked(weekName: string, startingVolumeCount: number): boolean {
    return parseWeekNumber(weekName) === 1 || startingVolumeCount > 0
}

export function selectWeekOneId(weeks: WeekRow[]): number {
    const weekOne = weeks.find((week) => parseWeekNumber(week.week_name) === 1)
    if (!weekOne) {
        throw new Error("WEEK_ONE_NOT_FOUND")
    }
    return weekOne.id
}



cycle.post("/create",authMiddleware,  async (c) => {
    const prisma = getPrismaClient(c.env)
    const body = await c.req.json();
    const safe = validateMesocycleInput.safeParse(body);
    if(!safe.success){
        const errors = safe.error.flatten().fieldErrors;
        return c.json({
            message: "Invalid input",
            errors
        }, 400)
    }
    const {name, numberOfweeks, volume: volumeInput, frequencies} = safe.data;
    const userId = c.get("userId")
    const id = await prisma.mesocycle.create({
        data:{
            name:name,
            // @ts-ignore
            userId: userId.userID
        }
    })
    
   
    const result = await frequency(frequencies, id.id, prisma)
    
    const weekResult = await week(prisma, id.id, numberOfweeks)
    const weekOneId = selectWeekOneId(weekResult)
    const volumeResult = await volume(prisma, weekOneId, volumeInput);
    
    return c.json({
        messsage:"mesocycle created successfully",
        id: id.id,
        frequencies: result,
        week: weekResult,
        volume: volumeResult
    },201)

})


cycle.get("/all",authMiddleware, async(c)=>{
    const prisma = getPrismaClient(c.env)
    
    const userId = c.get("userId")
    
    try{
        const searchResult = await Allmesocycle(prisma,userId )

        const formattedResult = searchResult.map((result:any) => {
        const total_session = result.week.reduce((sum: number, week: any) => {
                return sum + week._count.session;
            }, 0);

        const unlockedWeeks = result.week.filter(
            (week: any) => isWeekUnlocked(week.week_name, week._count.startingvolume)
        ).length;
        
        const completed = Math.max(unlockedWeeks - 1, 0);
        return {
            id: result.id,
            name: result.name,
            completed,
            total_session,
            _count: {
                week: result.week.length,
            },
        };
    });
        return c.json({
        message:"Fetched is successfull",
        data: formattedResult
    })
    }
    catch(error){
       
        return c.json({
            erroeMessage:"something happened",
        })
    }
    
})


cycle.get("/:id",authMiddleware, async (c)=>{
    const id = Number(c.req.param("id"))
    const prisma = getPrismaClient(c.env)

    const userId = c.get("userId")

    if (!Number.isFinite(id) || id <= 0) {
        return c.json({ message: "Invalid mesocycle id" }, 400)
    }

    const mesocycleRow = await getMesocycleById(prisma, id, userId)

    if (!mesocycleRow) {
        return c.json({ message: "Mesocycle not found" }, 404)
    }

    const weekname = await getWeeksWithUnlockStatus(prisma, id, isWeekUnlocked)

    const weekIds = weekname.map((week) => week.id)

    const formattedtotalSession = await getTotalSessionCount(prisma, weekIds)


    const result = {
        "name": mesocycleRow,
        "weekname": weekname,
        "totalsession":formattedtotalSession ,
        }

    return c.json({
        result: result
    })
    
})



cycle.delete("/:id", authMiddleware, async (c) => {
    const prisma = getPrismaClient(c.env)
    const id = Number(c.req.param("id"))
    const userId = c.get("userId")

    if (!Number.isFinite(id) || id <= 0) {
        return c.json({ message: "Invalid mesocycle id" }, 400)
    }

    const mesocycle = await prisma.mesocycle.findFirst({
        where: {
            id,
            userId: userId.userID,
            deletedAt: null
        }
    })

    if (!mesocycle) {
        return c.json({ message: "Mesocycle not found" }, 404)
    }

    try {
        const result = await softDeleteMesocycle(prisma, id)
        return c.json(
            {
                message: "Mesocycle soft deleted successfully",
                result,
            },
            200
        )
    } catch (error) {
        const knownError = error as Error
        if (knownError.message === "MESOCYCLE_NOT_FOUND") {
            return c.json({ message: "Mesocycle not found" }, 404)
        }
        return c.json(
            {
                message: "Failed to soft delete mesocycle",
                error: knownError.message,
            },
            500
        )
    }
})


export default cycle;
