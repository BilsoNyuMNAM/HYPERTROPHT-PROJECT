import { prisma } from "../../prisma.js";

/*
1. Get the feedback row of the muscle of the session.
2. Calculate the recovery state and set delta from the lookup table.
3. Return the new total number of sets for that muscle.
*/

export type RecoveryState = "UNDER_RECOVERED" | "RECOVERED" | "WELL_RECOVERED";

export const VOLUME_LOOKUP_TABLE: Record<RecoveryState, Record<number, number>> = {
  UNDER_RECOVERED: {
    1: -1,
    2: -1,
    3: -1,
  },
  RECOVERED: {
    1: 1, // pump was low, might need 1 more set
    2: 0, // good pump and recovered: maintain volume
    3: 0, // great pump: maintain volume
  },
  WELL_RECOVERED: {
    1: 1, // no/barely any pump: raise sets
    2: 0, // good pump: maintain volume
    3: 0, // great pump: maintain volume
  },
};

export function getRecoveryState(soreness: number, workload: number): RecoveryState {
  if (soreness >= 3 || workload >= 3) {
    return "UNDER_RECOVERED";
  }
  if (soreness <= 1 && workload <= 1 && soreness >= 0 && workload >= 0) {
    return "WELL_RECOVERED";
  }
  return "RECOVERED";
}

export default async function Autoregulation(
  muscleId: number,
  sessionId: number,
  currentSetCount?: number,
  tx: any = prisma
): Promise<number> {
  const feedbackrow = await tx.feedback.findFirst({
    where: {
      musclegroupid: muscleId,
      workoutid: sessionId,
    },
  });

  let delta = 0;

  if (feedbackrow) {
    // Safety check: if joint pain is 2 or higher, reduce volume
    if (feedbackrow.jointpain >= 2) {
      delta = -1;
    } else {
      const recoveryState = getRecoveryState(
        feedbackrow.soreness,
        feedbackrow.workload
      );
      delta = VOLUME_LOOKUP_TABLE[recoveryState][feedbackrow.pump] ?? 0;
    }
  }

  // Determine current set count if not explicitly passed
  let sets = currentSetCount;
  if (sets === undefined) {
    const sessionExercises = await tx.sessionexercise.findMany({
      where: {
        workoutid: sessionId,
        exercise: {
          muscleGroupId: muscleId,
        },
      },
      include: {
        set: true,
      },
    });

    sets = sessionExercises.reduce(
      (acc: number, se: any) => acc + (se.set?.length || 0),
      0
    );
  }

  const totalset = Math.max(0, (sets ?? 0) + delta);
  return totalset;
}
