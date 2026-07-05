import { Hono } from "hono";
import { getPrismaClient } from "../../../lib/prismaClient";
import { authMiddleware } from "../../utils/authMiddleware";

const muscleToggleRoute = new Hono<{
  Bindings: { DATABASE_URL: string; JWT_TOKEN: string };
  Variables: { userId: any };
}>();

muscleToggleRoute.get("/status/:weekId", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const weekId = Number(c.req.param("weekId"));
  const userId = c.get("userId");

  if (!Number.isFinite(weekId) || weekId <= 0) {
    return c.json({ message: "Invalid week id" }, 400);
  }

  const week = await prisma.week.findFirst({
    where: {
      id: weekId,
      mesocycle: {
        userId: userId.userID,
      },
      deletedAt: null,
    },
    select: { id: true, mesocycleId: true },
  });

  if (!week) {
    return c.json({ message: "Week not found" }, 404);
  }

  const frequencies = await prisma.frequency.findMany({
    where: {
      mesocycleId: week.mesocycleId,
      deletedAt: null,
    },
    select: {
      muscleId: true,
      muscle: {
        select: {
          muscle_name: true,
        },
      },
    },
  });

  const startingVolumes = await prisma.startingVolume.findMany({
    where: {
      weekId,
      deletedAt: null,
    },
    select: {
      muscleId: true,
      set: true,
    }
  });

  const volumeMap = new Map();
  startingVolumes.forEach(sv => volumeMap.set(sv.muscleId, sv.set));

  const muscles = frequencies.map(
    (f: { muscleId: number; muscle: { muscle_name: string } }) => {
      const volumeSet = volumeMap.get(f.muscleId) ?? 0;
      return {
        muscleId: f.muscleId,
        muscleName: f.muscle.muscle_name,
        active: volumeSet > 0,
      };
    }
  );

  return c.json({ muscles }, 200);
});

muscleToggleRoute.post("/toggle", authMiddleware, async (c) => {
  const prisma = getPrismaClient(c.env);
  const userId = c.get("userId");
  const body = await c.req.json();

  const { weekId, muscleId, active } = body as {
    weekId: number;
    muscleId: number;
    active: boolean;
  };

  if (
    !Number.isFinite(weekId) ||
    !Number.isFinite(muscleId) ||
    typeof active !== "boolean"
  ) {
    return c.json({ message: "Invalid input" }, 400);
  }

  const week = await prisma.week.findFirst({
    where: {
      id: weekId,
      mesocycle: {
        userId: userId.userID,
      },
      deletedAt: null,
    },
    select: { id: true, mesocycleId: true },
  });

  if (!week) {
    return c.json({ message: "Week not found" }, 404);
  }

  const startingVolume = await prisma.startingVolume.findFirst({
    where: {
      weekId,
      muscleId,
      deletedAt: null,
    },
    select: { id: true, set: true },
  });

  if (!startingVolume) {
    return c.json({ message: "Starting volume entry not found for this muscle in this week" }, 404);
  }

  // Use the negative trick to toggle active state while preserving magnitude
  let newSetVolume = startingVolume.set;

  if (active) {
    // Math.abs ensures it's positive (active). Handle 0 edge case just in case it was stuck from old bugs.
    newSetVolume = startingVolume.set === 0 ? 2 : Math.abs(startingVolume.set);

    await prisma.$transaction([
      prisma.startingVolume.update({
        where: { id: startingVolume.id },
        data: { set: newSetVolume },
      }),
      prisma.frequency.updateMany({
        where: { mesocycleId: week.mesocycleId, muscleId, deletedAt: null, timesPerWeek: 0 },
        data: { timesPerWeek: 2 }
      })
    ]);
  } else {
    // -Math.abs ensures it's negative (deactivated). Prevent it from being exactly -0.
    newSetVolume = startingVolume.set === 0 ? -2 : -Math.abs(startingVolume.set);

    await prisma.startingVolume.update({
      where: { id: startingVolume.id },
      data: { set: newSetVolume },
    });
  }

  return c.json(
    {
      message: active
        ? "Muscle reactivated for this week"
        : "Muscle deactivated for this week",
      muscleId,
      active,
    },
    200
  );
});

export default muscleToggleRoute;
