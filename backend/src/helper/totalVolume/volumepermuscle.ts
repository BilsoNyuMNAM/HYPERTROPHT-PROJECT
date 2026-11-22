import {prisma} from "../../prisma.js"

const MUSCLE_GROUPS = 12;

export default async function TotalVolume( mesocycleId:number){
    const [mesocycle, rows] = await Promise.all([
        prisma.mesocycle.findUnique({
            where: { id: mesocycleId },
            select: { length: true },
        }),
        prisma.sessionexercise.findMany({
            where:
             { whichsession: 
                { mesocycleId } 
            },
            select: {
                whichsession: { select: { weeknumber: true } },
                exercise: { select: { muscleGroupId: true } },
                _count: { select: { set: true } },
            },
        }),
    ]);

    const totalVolume: Record<number, number[]> = {};
    for (let week = 1; week <= mesocycle!.length; week++) { //finalshape = {1: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] ..... }
        totalVolume[week] = Array(MUSCLE_GROUPS).fill(0);
    }

//rows = [{whichsession:{weeknumber:1}, exercise:{ muscleGroupId: 3 }, _count: { set: 4 }}, {}, {}]

    for (const row of rows) {
        const week = totalVolume[row.whichsession.weeknumber];
        if (!week) continue;
        const idx = row.exercise.muscleGroupId - 1;
        if (idx < 0 || idx >= MUSCLE_GROUPS) continue;
        week[idx] = (week[idx] ?? 0) + row._count.set; //whatever the value was in that index add row._count.set
    }

    return totalVolume;
}
