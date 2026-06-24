
import { PrismaClient } from "../generated/prisma/client";
 async function getMesocycleById(prisma: any, id: number, userId: any) {
    return prisma.mesocycle.findFirst({
        where: {
            id,
            deletedAt: null,
            userId:userId.userID
        },
        select: {
            id: true,
            name: true,
        },
    });
}

export {getMesocycleById}