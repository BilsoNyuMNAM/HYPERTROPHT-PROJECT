import { Context, Hono, Next } from "hono";
import { getPrismaClient } from "../../../../lib/prismaClient";
import { decodeJwt } from "../../../utils/jwt";
import { authMiddleware } from "../../../utils/authMiddleware";
import { validateWeekOwnership } from "../../../service/validateWeekOwnership";
import { getAllSession } from "../../../service/getAllSession";
import { createSession } from "../../../service/createSession";
import {
  getSessionWeeklySetSummarySeed,
  saveSessionExercises,
  SessionPayload,
  softDeleteSession,
} from "../../../service";
import  {completeUpdate} from "../../../service/Completeupdate";


const sessionRoute = new Hono<{ Bindings: { DATABASE_URL: string; JWT_TOKEN: string }; Variables: { userId: any } }>();





sessionRoute.get("/all/:weekId", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));
  const userId = c.get("userId");

  const weekResult = await validateWeekOwnership(weekId, userId, prisma)
  
  if(weekResult){
    const sessions = await getAllSession(weekId, prisma)
  const length = sessions.sessions.length;
  return c.json({
    message: `All the session for weekID ${weekId} is fetched successfully:`,
    result: sessions,
    totalSessions: length,
  });
  }
  return c.json({
    message:"Forbidden"
  }, 403)
  
});

sessionRoute.post("/create/:weekId", authMiddleware, async (c) => {
  const body = await c.req.json();
  const prisma = getPrismaClient(c.env);
  const sessionName = body.session_name;
  if(sessionName.trim().length === 0 || sessionName === undefined){
    return c.json(
      {
        message: "Session name cannot be empty",
      },
      400
    )
  }
  const weekId = Number(c.req.param("weekId"));
  if(weekId <=0 || !Number.isFinite(weekId)){
    return c.json(
      {
        message: "Invalid week id",
      },
      400
    );
  }
  const userId = c.get("userId");
  const validUser = await validateWeekOwnership(weekId, userId, prisma);

  if (validUser) {
    const result = await createSession(prisma, sessionName, weekId)
      return c.json(
        {
          message: "Session created successfully",
        },
        201
    );
  }
  return c.json(
    {
      message: "Week not found or you don't have permission to add session to this week",
    },404);
  
});


sessionRoute.post("/add/set/:sessionId", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  //TODO: check if the sessionId is a valid number of not (NaN / 0)
  const userId = c.get("userId");
  const body: SessionPayload = await c.req.json();

  const activeSession = await prisma.session.findFirst({
    where: {
      id: sessionId,
      deletedAt: null,
      week: {
        deletedAt: null,
        mesocycle: {
          deletedAt: null,
          userId: userId.userID,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!activeSession) {
    return c.json(
      {
        message: "Session not found",
      },
      404
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await saveSessionExercises(tx, sessionId, body.sessionData);
      },
      { maxWait: 15000, timeout: 15000 }
    );

    return c.json({
      message: "Session is saved successfully",
    });
  } catch (error) {
    return c.json(
      {
        error: "An error occurred while saving the session data",
      },
      500
    );
  }
});



sessionRoute.patch("/booleanUpdate/:weekId", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));
  const userId = c.get("userId");
  const body = await c.req.json();
  const completed = body.booleanStatus;

  const validUser = await validateWeekOwnership(weekId, userId, prisma);
  if (!validUser) {
    return c.json(
      {
        message: "Week not found or you don't have permission to modify this week",
      },
      404
    );
  }
  try {
    const booleanResult = await completeUpdate(weekId, completed, prisma);
    return c.json(
      {
        message: "boolean update successfull",
        result: booleanResult,
      },
      200
    );
  } catch (error) {
    const knownError = error as Error;
    if (knownError.message === "WEEK_NOT_FOUND") {
      return c.json(
        {
          message: "Week not found",
        },
        404
      );
    }
    console.error("[booleanUpdate] Unexpected error:", knownError);
    return c.json(
      {
        message: "Failed to update week status",
      },
      500
    );
  }
});

sessionRoute.delete("/:sessionId", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  const userId = c.get("userId");

  if (!Number.isFinite(sessionId) || sessionId <= 0) {
    return c.json(
      {
        message: "Invalid session id",
      },
      400
    );
  }

  const activeSession = await prisma.session.findFirst({
    where: {
      id: sessionId,
      deletedAt: null,
      week: {
        deletedAt: null,
        mesocycle: {
          deletedAt: null,
          userId: userId.userID,
        },
      },
    },
  });

  if (!activeSession) {
    return c.json(
      {
        message: "Session not found",
      },
      404
    );
  }

  try {
    const result = await softDeleteSession(prisma, sessionId);
    return c.json(
      {
        message: "Session soft deleted successfully",
        result,
      },
      200
    );
  } catch (error) {
    const knownError = error as Error;

    if (knownError.message === "SESSION_NOT_FOUND") {
      return c.json(
        {
          message: "Session not found",
        },
        404
      );
    }

    console.error("[deleteSession] Unexpected error:", knownError);
    return c.json(
      {
        message: "Failed to delete session",
      },
      500
    );
  }
});



sessionRoute.get("/:sessionId", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const sessionId = Number(c.req.param("sessionId"));
  const userId = c.get("userId");
  const activeSession = await prisma.session.findFirst({
    where: {
      id: sessionId,
      deletedAt: null,
      week: {
        deletedAt: null,
        mesocycle: {
          deletedAt: null,
          userId: userId.userID,
        },
      },
    },
    select: {
      session_name: true,
      id: true,
      weekId: true,
      exerciselogs: {
        where: {
          deletedAt: null,
        },
        select: {
          exercise: {
            select: {
              exercise_name: true,
              muscle: {
                select: {
                  muscle_name: true,
                },
              },
            },
          },
          set: {
            where: {
              deletedAt: null,
            },
            select: {
              reps: true,
              weight: true,
              rir: true,
            },
          },
        },
      },
      sessionmusclefeedback: {
        where: {
          deletedAt: null,
        },
        select: {
          muscle: {
            select: {
              muscle_name: true,
            },
          },
          sorenessfeedback: {
            select: {
              soreness_score: true,
              description: true,
            },
          },
          performancefeedback: {
            select: {
              performance_score: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (activeSession === null) {
    return c.json(
      {
        message: "No session found with the specified id",
      },
      404
    );
  }

 
  const feedbackMap = new Map();
  activeSession.sessionmusclefeedback?.forEach((fb) => {
    if (fb.muscle?.muscle_name) {
      feedbackMap.set(fb.muscle.muscle_name, {
        soreness: fb.sorenessfeedback
          ? {
              soreness_score: fb.sorenessfeedback.soreness_score,
              description: fb.sorenessfeedback.description,
            }
          : null,
        performance: fb.performancefeedback
          ? {
              performance_score: fb.performancefeedback.performance_score,
              description: fb.performancefeedback.description,
            }
          : null,
      });
    }
  });

  const eachexercise = activeSession.exerciselogs.map((exerciselog) => {
    const exercise_name = exerciselog.exercise.exercise_name;
    const muscletrained = exerciselog.exercise.muscle.muscle_name;
    const set = exerciselog.set;

    // Get feedback for this muscle if it exists
    const feedback = feedbackMap.get(muscletrained);

    return {
      exercise_name,
      muscletrained,
      set,
      ...(feedback?.soreness && { soreness: feedback.soreness }),
      ...(feedback?.performance && { performance: feedback.performance }),
    };
  });

  const weeklySetSummarySeed = await getSessionWeeklySetSummarySeed(
    prisma,
    activeSession.weekId,
    sessionId
  );

  return c.json({
    message: "Session data with the specified id is being fetched",
    session_name: activeSession.session_name,
    eachexercise: eachexercise,
    weeklySetSummarySeed,
  });
});

export default sessionRoute;
