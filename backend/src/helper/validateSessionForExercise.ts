import { prisma } from "../prisma.js"

type SessionCheck = { ok: true } | { ok: false; status: number; message: string }

//checks the session exists and matches the mesocycle/week/day the client claims
export default async function validateSessionForExercise(
    sessionId: number,
    mesocycleId: number,
    weeknumber: number,
    daynumber: number
): Promise<SessionCheck> {
    const session = await prisma.session.findUnique({
        where: { id: Number(sessionId) },
        select: { mesocycleId: true, weeknumber: true, daynumber: true }
    })
    if (!session) {
        return { ok: false, status: 404, message: "Session not found" }
    }
    if (session.mesocycleId !== Number(mesocycleId)) {
        return { ok: false, status: 400, message: "Session does not belong to this mesocycle" }
    }
    if (session.weeknumber !== Number(weeknumber) || session.daynumber !== Number(daynumber)) {
        return { ok: false, status: 400, message: "weeknumber and daynumber do not match the session" }
    }
    return { ok: true }
}
