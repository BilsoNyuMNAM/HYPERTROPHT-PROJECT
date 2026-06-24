import { Hono } from "hono";
import { getPrismaClient } from "../../../../lib/prismaClient";
import { authMiddleware } from "../../../utils/authMiddleware";
import { validateWeekOwnership } from "../../../service/validateWeekOwnership";
import {
  calculateAndWriteNextWeekVolumes,
  resetMesocycleFromWeek,
  ValidationIssue,
} from "../../../service/weekProgressionService";

const weekProgressionRoute = new Hono<{ Bindings: { DATABASE_URL: string; JWT_TOKEN: string }; Variables: { userId: any } }>();

weekProgressionRoute.post("/calculate-next/:weekId", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));
  const userId = c.get("userId");

  if (!Number.isFinite(weekId) || weekId <= 0) {
    return c.json(
      {
        message: "Invalid week id",
      },
      400
    );
  }

  const validUser = await validateWeekOwnership(weekId, userId, prisma);
  if (!validUser) {
    return c.json(
      {
        message: "Week not found or you don't have permission to calculate next week volume",
      },
      404
    );
  }

  try {
    const result = await calculateAndWriteNextWeekVolumes(prisma, weekId);

    return c.json(
      {
        message: "Next week volume calculated successfully",
        nextWeekId: result.nextWeekId,
        volumes: result.volumes,
      },
      200
    );
  } catch (error) {
    const knownError = error as Error & { issues?: ValidationIssue[] };

    if (knownError.message === "FINAL_WEEK") {
      return c.json(
        {
          message: "Mesocycle is complete. No next week exists.",
          code: "FINAL_WEEK",
        },
        400
      );
    }

    if (knownError.message === "VALIDATION_FAILED") {
      const issues = knownError.issues || [];
      const hasWeekNotFound = issues.some((issue) => issue.code === "WEEK_NOT_FOUND");

      return c.json(
        {
          message: hasWeekNotFound
            ? "Week not found"
            : "Week is incomplete. Complete planned muscle volume, all sets, and required feedback before calculating.",
          code: hasWeekNotFound ? "WEEK_NOT_FOUND" : "VALIDATION_FAILED",
          errors: issues,
        },
        hasWeekNotFound ? 404 : 400
      );
    }

    return c.json(
      {
        message: "Failed to calculate next week volume",
        error: knownError.message,
      },
      500
    );
  }
});

weekProgressionRoute.post("/reset-from/:weekId", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));
  const userId = c.get("userId");

  if (!Number.isFinite(weekId) || weekId <= 0) {
    return c.json(
      {
        message: "Invalid week id",
      },
      400
    );
  }

  const validUser = await validateWeekOwnership(weekId, userId, prisma);
  if (!validUser) {
    return c.json(
      {
        message: "Week not found or you don't have permission to reset from this week",
      },
      404
    );
  }

  try {
    const result = await resetMesocycleFromWeek(prisma, weekId);
    return c.json(
      {
        message:
          "Reset completed. Selected week and following weeks are now locked until recalculated.",
        result,
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
    if (knownError.message === "WEEK_ONE_RESET_NOT_ALLOWED") {
      return c.json(
        {
          message: "Week 1 cannot be reset. Select week 2 or later.",
          code: "WEEK_ONE_RESET_NOT_ALLOWED",
        },
        400
      );
    }

    return c.json(
      {
        message: "Failed to reset mesocycle from selected week",
        error: knownError.message,
      },
      500
    );
  }
});

export default weekProgressionRoute;
