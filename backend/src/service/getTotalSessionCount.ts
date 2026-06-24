import { PrismaClient } from "../generated/prisma/client";

 async function getTotalSessionCount(prisma: any, weekIds: number[]): Promise<number> {
    if (!weekIds.length) return 0;

    return prisma.session.count({
        where: {
            weekId: {
                in: weekIds,
            },
            deletedAt: null,
        },
    });
}

export { getTotalSessionCount }
