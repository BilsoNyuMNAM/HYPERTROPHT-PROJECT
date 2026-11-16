-- CreateTable
CREATE TABLE "exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroupId" INTEGER NOT NULL,

    CONSTRAINT "exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesocycle" (
    "id" SERIAL NOT NULL,
    "mesoname" TEXT NOT NULL,
    "length" INTEGER NOT NULL,

    CONSTRAINT "mesocycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "mesocycleId" INTEGER NOT NULL,
    "weeknumber" INTEGER NOT NULL,
    "daynumber" INTEGER NOT NULL,
    "label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesocyclepriority" (
    "id" SERIAL NOT NULL,
    "mesocycleId" INTEGER NOT NULL,
    "musclegroupid" INTEGER NOT NULL,
    "priority" TEXT NOT NULL,

    CONSTRAINT "mesocyclepriority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessionexercise" (
    "id" SERIAL NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "workoutid" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "sessionexercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "workoutid" INTEGER NOT NULL,
    "musclegroupid" INTEGER NOT NULL,
    "soreness" INTEGER NOT NULL,
    "pump" INTEGER NOT NULL,
    "workload" INTEGER NOT NULL,
    "jointpain" INTEGER NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "set" (
    "id" SERIAL NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "reps" INTEGER,
    "rir" INTEGER,
    "repsTarget" INTEGER,
    "rirTarget" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sessionexerciseId" INTEGER NOT NULL,

    CONSTRAINT "set_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_name_key" ON "exercise"("name");

-- CreateIndex
CREATE UNIQUE INDEX "set_sessionexerciseId_setNumber_key" ON "set"("sessionexerciseId", "setNumber");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "mesocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesocyclepriority" ADD CONSTRAINT "mesocyclepriority_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "mesocycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessionexercise" ADD CONSTRAINT "sessionexercise_workoutid_fkey" FOREIGN KEY ("workoutid") REFERENCES "session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessionexercise" ADD CONSTRAINT "sessionexercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_workoutid_fkey" FOREIGN KEY ("workoutid") REFERENCES "session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set" ADD CONSTRAINT "set_sessionexerciseId_fkey" FOREIGN KEY ("sessionexerciseId") REFERENCES "sessionexercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
