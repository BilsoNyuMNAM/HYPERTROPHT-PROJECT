export default async function AddexerciseTosession(
    tx: any,
    exerciseId: number,
    sessionId: number,
    rirTarget: number | undefined,
    mesocycleId: number,
    weeknumber: number,
    daynumber: number
) {
    let targetRir = rirTarget != null ? Number(rirTarget) : null

    if (targetRir == null) { //get the rir target from the database 
        const existingSet = await tx.set.findFirst({
            where: { whichsessionexercise: { workoutid: sessionId } },
            select: { rirTarget: true }
        })
        targetRir = existingSet?.rirTarget ?? 2
    }

    //get all the remaining same sessions for the mesocycle 
    const queryResult = await tx.session.findMany({
        where: {
            mesocycleId: Number(mesocycleId),
            OR: [
                { weeknumber: { gt: Number(weeknumber) }, daynumber: Number(daynumber) }, //later week, same day
                { weeknumber: Number(weeknumber), daynumber: Number(daynumber) } //this week, same day
            ]
        },
        orderBy: { weeknumber: "asc" }
    })

    //building array of data for the createManyAndReturn data key 
    const data = queryResult.map((e: any) => ({
        exerciseId: Number(exerciseId),
        workoutid: e.id
    }))

    //adding the exerciseId to the sessions
    const sesionresult = await tx.sessionexercise.createManyAndReturn({
        data: data //[{},{},{}]
    })

    //building array of data for the createMany data key 
    const data1 = sesionresult.flatMap((e: any) => [
        { sessionexerciseId: e.id, setNumber: 1, rirTarget: targetRir, status: "pending" },
        { sessionexerciseId: e.id, setNumber: 2, rirTarget: targetRir, status: "pending" }
    ])

    await tx.set.createMany({
        data: data1
    })

   
}

