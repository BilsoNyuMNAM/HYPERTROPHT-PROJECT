import { PrismaClient } from "../generated/prisma/client";

async function getWeeksWithUnlockStatus(prisma: any,
    mesocycleId: number, isWeekUnlocked: (weekName: string, count: number) => boolean){
        const weeks = await prisma.week.findMany({
        where: {
            mesocycleId,
            deletedAt: null,
        },
        select: {
            id: true,
            week_name: true,
            mesocycleId: true,
        },
        orderBy: {
            id: "asc",
        },
    });

    const weeksWithStatus = await Promise.all(
        weeks.map(async (week: any) => {
            const startingVolumeCount = await prisma.startingVolume.count({
                where: {
                    weekId: week.id,
                    deletedAt: null,
                },
            });

            return {
                id: week.id,
                week_name: week.week_name,
                mesocycleId: week.mesocycleId,
                unlocked: isWeekUnlocked(week.week_name, startingVolumeCount),
                startingVolumeCount,
            };
        })
    );

    return weeksWithStatus;
    
}

export {getWeeksWithUnlockStatus}