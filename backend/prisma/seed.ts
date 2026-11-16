import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const exercises = [
  {
    "name": "Pushup Deficit",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Press Flat",
    "muscleGroupId": 1
  },
  {
    "name": "Hammer Machine Chest Press Flat",
    "muscleGroupId": 1
  },
  {
    "name": "Hammer Machine Chest Press Incline",
    "muscleGroupId": 1
  },
  {
    "name": "Machine Chest Press",
    "muscleGroupId": 1
  },
  {
    "name": "Bench Press Medium Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Bench Press Narrow Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Pushup Narrow Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Pushup",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Bench Press Wide Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Bench Press Medium Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Bench Press Narrow Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Bench Press Wide Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Cable Flye Bent Over",
    "muscleGroupId": 1
  },
  {
    "name": "Cable Flye",
    "muscleGroupId": 1
  },
  {
    "name": "Cable Flye Underhand",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Flye Flat",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Press Flye Flat",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Flye Incline",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Press Flye Incline",
    "muscleGroupId": 1
  },
  {
    "name": "Machine Flye",
    "muscleGroupId": 1
  },
  {
    "name": "Pec Dec Flye",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Press Medium Incline",
    "muscleGroupId": 1
  },
  {
    "name": "Machine Chest Press Incline",
    "muscleGroupId": 1
  },
  {
    "name": "Bench Press Incline Medium Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Bench Press Incline Narrow Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Bench Press Incline Wide Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Press Low Incline",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Press Medium Incline Wide Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Press Medium Incline Medium Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Row 2-Arm",
    "muscleGroupId": 2
  },
  {
    "name": "Barbell Bent Over Row",
    "muscleGroupId": 2
  },
  {
    "name": "Barbell Row To Chest",
    "muscleGroupId": 2
  },
  {
    "name": "Chest Supported Row",
    "muscleGroupId": 2
  },
  {
    "name": "Seated Cable Row",
    "muscleGroupId": 2
  },
  {
    "name": "Dumbbell Row Single-Arm Supported",
    "muscleGroupId": 2
  },
  {
    "name": "EZ Bar Row Underhand",
    "muscleGroupId": 2
  },
  {
    "name": "Cambered Bar Row",
    "muscleGroupId": 2
  },
  {
    "name": "Hammer Machine Row High",
    "muscleGroupId": 2
  },
  {
    "name": "Hammer Machine Row Low",
    "muscleGroupId": 2
  },
  {
    "name": "Dumbbell Row 2-Arm Incline",
    "muscleGroupId": 2
  },
  {
    "name": "Inverted Row",
    "muscleGroupId": 2
  },
  {
    "name": "Machine Chest Supported Row",
    "muscleGroupId": 2
  },
  {
    "name": "Seal Row",
    "muscleGroupId": 2
  },
  {
    "name": "Smith Machine Row",
    "muscleGroupId": 2
  },
  {
    "name": "T Bar Row",
    "muscleGroupId": 2
  },
  {
    "name": "Barbell Flexion Row",
    "muscleGroupId": 2
  },
  {
    "name": "Cable Flexion Row",
    "muscleGroupId": 2
  },
  {
    "name": "Dumbbell Row To Hips",
    "muscleGroupId": 2
  },
  {
    "name": "Assisted Pullup Normal Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Assisted Pullup Parallel Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Assisted Pullup Underhand Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Assisted Pullup Wide Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Dumbbell Pullover",
    "muscleGroupId": 2
  },
  {
    "name": "Machine Pullover",
    "muscleGroupId": 2
  },
  {
    "name": "Pulldown Narrow Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pulldown Normal Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pullup Normal Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pullup Parallel Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pulldown Parallel Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pulldown Straight Arm",
    "muscleGroupId": 2
  },
  {
    "name": "Pulldown Underhand Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pullup Underhand Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pulldown Wide Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pullup Wide Grip",
    "muscleGroupId": 2
  },
  {
    "name": "Pulldown Upright Torso To Abs",
    "muscleGroupId": 2
  },
  {
    "name": "Assisted Dip",
    "muscleGroupId": 3
  },
  {
    "name": "Barbell Skullcrusher",
    "muscleGroupId": 3
  },
  {
    "name": "Cable Triceps Pushdown Bar",
    "muscleGroupId": 3
  },
  {
    "name": "Dip Triceps Focused",
    "muscleGroupId": 3
  },
  {
    "name": "Dumbbell Skullcrusher",
    "muscleGroupId": 3
  },
  {
    "name": "Inverted Skullcrusher",
    "muscleGroupId": 3
  },
  {
    "name": "Cable Triceps Pushdown Rope",
    "muscleGroupId": 3
  },
  {
    "name": "Cable Triceps Pushdown Single-Arm",
    "muscleGroupId": 3
  },
  {
    "name": "JM Press",
    "muscleGroupId": 3
  },
  {
    "name": "Barbell Overhead Triceps Extension",
    "muscleGroupId": 3
  },
  {
    "name": "Cable Overhead Triceps Extension",
    "muscleGroupId": 3
  },
  {
    "name": "Cable Overhead Triceps Extension Rope",
    "muscleGroupId": 3
  },
  {
    "name": "EZ Bar Overhead Triceps Extension",
    "muscleGroupId": 3
  },
  {
    "name": "Machine Triceps Extension",
    "muscleGroupId": 3
  },
  {
    "name": "Barbell Overhead Triceps Extension Seated",
    "muscleGroupId": 3
  },
  {
    "name": "EZ Bar Overhead Triceps Extension Seated",
    "muscleGroupId": 3
  },
  {
    "name": "Dumbbell Overhead Extension Single-Arm",
    "muscleGroupId": 3
  },
  {
    "name": "Dumbbell Curl 2-Arm",
    "muscleGroupId": 4
  },
  {
    "name": "Dumbbell Curl Alternating",
    "muscleGroupId": 4
  },
  {
    "name": "Barbell Curl Narrow Grip",
    "muscleGroupId": 4
  },
  {
    "name": "Barbell Curl Normal Grip",
    "muscleGroupId": 4
  },
  {
    "name": "Cable Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Cable Curl EZ Bar",
    "muscleGroupId": 4
  },
  {
    "name": "Cable Curl EZ Bar Wide Grip",
    "muscleGroupId": 4
  },
  {
    "name": "Cable Rope Twist Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Dumbbell Preacher Curl Single-Arm",
    "muscleGroupId": 4
  },
  {
    "name": "Dumbbell Spider Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Dumbbell Twist Curl",
    "muscleGroupId": 4
  },
  {
    "name": "EZ Bar Curl Narrow Grip",
    "muscleGroupId": 4
  },
  {
    "name": "EZ Bar Curl Wide Grip",
    "muscleGroupId": 4
  },
  {
    "name": "EZ Bar Preacher Curl",
    "muscleGroupId": 4
  },
  {
    "name": "EZ Bar Spider Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Hammer Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Dumbbell Curl Incline",
    "muscleGroupId": 4
  },
  {
    "name": "Machine Preacher Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Freemotion Curl Facing Machine",
    "muscleGroupId": 4
  },
  {
    "name": "Freemotion Curl Facing Away",
    "muscleGroupId": 4
  },
  {
    "name": "Barbell Upright Row",
    "muscleGroupId": 5
  },
  {
    "name": "Cable Cross Body Lateral Raise",
    "muscleGroupId": 5
  },
  {
    "name": "Cable Leaning Lateral Raise",
    "muscleGroupId": 5
  },
  {
    "name": "Cable Upright Row",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Lateral Raise",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Upright Row",
    "muscleGroupId": 5
  },
  {
    "name": "Machine Lateral Raise",
    "muscleGroupId": 5
  },
  {
    "name": "Smith Machine Upright Row",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Lateral Raise Thumbs Down",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Lateral Raise Top Hold",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Lateral Raise Super ROM",
    "muscleGroupId": 5
  },
  {
    "name": "Freemotion Y Raises",
    "muscleGroupId": 5
  },
  {
    "name": "Barbell Facepull",
    "muscleGroupId": 5
  },
  {
    "name": "Cable Cross Body Bent Lateral Raise",
    "muscleGroupId": 5
  },
  {
    "name": "Cable Rope Facepull",
    "muscleGroupId": 5
  },
  {
    "name": "Cable Single-Arm Rear Delt Raise",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Bent Lateral Raise",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Facepull",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Facepull Incline",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Lateral Raise Incline",
    "muscleGroupId": 5
  },
  {
    "name": "Machine Reverse Flye",
    "muscleGroupId": 5
  },
  {
    "name": "Freemotion Rear Delt Flyes",
    "muscleGroupId": 5
  },
  {
    "name": "Cable Front Raise Underhand",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Front Raise",
    "muscleGroupId": 5
  },
  {
    "name": "Barbell Front Raise EZ Bar Underhand",
    "muscleGroupId": 5
  },
  {
    "name": "Machine Shoulder Press",
    "muscleGroupId": 5
  },
  {
    "name": "Barbell Shoulder Press Seated",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Shoulder Press Seated",
    "muscleGroupId": 5
  },
  {
    "name": "Smith Machine Shoulder Press Seated",
    "muscleGroupId": 5
  },
  {
    "name": "Barbell Shoulder Press Standing",
    "muscleGroupId": 5
  },
  {
    "name": "Dumbbell Shoulder Press Standing",
    "muscleGroupId": 5
  },
  {
    "name": "Barbell Split Squat",
    "muscleGroupId": 6
  },
  {
    "name": "Belt Squat",
    "muscleGroupId": 6
  },
  {
    "name": "Smith Machine Squat Feet Forward",
    "muscleGroupId": 6
  },
  {
    "name": "Front Squat",
    "muscleGroupId": 6
  },
  {
    "name": "Front Squat Cross Grip",
    "muscleGroupId": 6
  },
  {
    "name": "Hack Squat",
    "muscleGroupId": 6
  },
  {
    "name": "Barbell Squat High Bar",
    "muscleGroupId": 6
  },
  {
    "name": "Leg Extension",
    "muscleGroupId": 6
  },
  {
    "name": "Barbell Squat Narrow Stance",
    "muscleGroupId": 6
  },
  {
    "name": "Walking Lunges Quad Focused Bodyweight",
    "muscleGroupId": 6
  },
  {
    "name": "Sissy Squat No Machine",
    "muscleGroupId": 6
  },
  {
    "name": "Pendulum Squat",
    "muscleGroupId": 6
  },
  {
    "name": "Barbell Squat Safety Bar",
    "muscleGroupId": 6
  },
  {
    "name": "Barbell Hip Thrust",
    "muscleGroupId": 7
  },
  {
    "name": "Walking Lunges Glute Focused Barbell",
    "muscleGroupId": 7
  },
  {
    "name": "Cable Pull Through",
    "muscleGroupId": 7
  },
  {
    "name": "Conventional Deadlift",
    "muscleGroupId": 7
  },
  {
    "name": "Deadlift Deficit",
    "muscleGroupId": 7
  },
  {
    "name": "Reverse Lunge Dumbbell",
    "muscleGroupId": 7
  },
  {
    "name": "Dumbbell Split Squat",
    "muscleGroupId": 7
  },
  {
    "name": "Walking Lunges Glute Focused Dumbbell",
    "muscleGroupId": 7
  },
  {
    "name": "Machine Glute Kickback",
    "muscleGroupId": 7
  },
  {
    "name": "Dumbbell Hip Thrust Single Leg",
    "muscleGroupId": 7
  },
  {
    "name": "Barbell Squat Sumo Stance",
    "muscleGroupId": 7
  },
  {
    "name": "Belt Squat Wide Stance",
    "muscleGroupId": 7
  },
  {
    "name": "Back Raise 45\u00b0",
    "muscleGroupId": 8
  },
  {
    "name": "Dumbbell Stiff Legged Deadlift",
    "muscleGroupId": 8
  },
  {
    "name": "Back Raise Glute Ham Deck",
    "muscleGroupId": 8
  },
  {
    "name": "Barbell Good Morning High Bar",
    "muscleGroupId": 8
  },
  {
    "name": "Barbell Good Morning Low Bar",
    "muscleGroupId": 8
  },
  {
    "name": "Stiff Legged Deadlift",
    "muscleGroupId": 8
  },
  {
    "name": "Barbell Good Morning Safety Bar",
    "muscleGroupId": 8
  },
  {
    "name": "Smith Machine Good Morning",
    "muscleGroupId": 8
  },
  {
    "name": "Lying Leg Curl",
    "muscleGroupId": 8
  },
  {
    "name": "Seated Leg Curl",
    "muscleGroupId": 8
  },
  {
    "name": "Single Leg Leg Curl",
    "muscleGroupId": 8
  },
  {
    "name": "Calf Machine",
    "muscleGroupId": 9
  },
  {
    "name": "Leg Press Calves",
    "muscleGroupId": 9
  },
  {
    "name": "Stair Calves Single Leg",
    "muscleGroupId": 9
  },
  {
    "name": "Smith Machine Calves",
    "muscleGroupId": 9
  },
  {
    "name": "Belt Squat Calves",
    "muscleGroupId": 9
  },
  {
    "name": "Barbell Bent Over Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Barbell Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Cable Bent Over Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Cable Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Cable Side Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Cable Single-Arm Side Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Dumbbell Bent Over Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Dumbbell Leaning Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Dumbbell Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Dumbbell Shrug Seated",
    "muscleGroupId": 10
  },
  {
    "name": "Barbell Standing Wrist Curl",
    "muscleGroupId": 11
  },
  {
    "name": "Dumbbell Bench Wrist Curl",
    "muscleGroupId": 11
  },
  {
    "name": "Dumbbell Standing Wrist Curl",
    "muscleGroupId": 11
  },
  {
    "name": "Cable Rope Crunch",
    "muscleGroupId": 12
  },
  {
    "name": "Hanging Knee Raise",
    "muscleGroupId": 12
  },
  {
    "name": "Hanging Straight Leg Raise",
    "muscleGroupId": 12
  },
  {
    "name": "Machine Crunch",
    "muscleGroupId": 12
  },
  {
    "name": "Modified Candlestick",
    "muscleGroupId": 12
  },
  {
    "name": "Reaching Sit Up",
    "muscleGroupId": 12
  },
  {
    "name": "Slant Board Sit Up Weighted",
    "muscleGroupId": 12
  },
  {
    "name": "V Up Weighted",
    "muscleGroupId": 12
  },
  {
    "name": "Pushup Weighted Narrow Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Pushup Weighted Normal Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Reverse Lunge Barbell",
    "muscleGroupId": 7
  },
  {
    "name": "Walking Lunges Quad Focused Dumbbell",
    "muscleGroupId": 6
  },
  {
    "name": "Walking Lunges Quad Focused Barbell",
    "muscleGroupId": 6
  },
  {
    "name": "Walking Lunges Glute Focused Bodyweight",
    "muscleGroupId": 7
  },
  {
    "name": "Cable Lateral Raise Single-Arm",
    "muscleGroupId": 5
  },
  {
    "name": "Lying Cable Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Bulgarian Split Squat Quad Focused",
    "muscleGroupId": 6
  },
  {
    "name": "Bulgarian Split Squat Glute Focused",
    "muscleGroupId": 7
  },
  {
    "name": "Goblet Squat",
    "muscleGroupId": 6
  },
  {
    "name": "Machine Hip Thrust",
    "muscleGroupId": 7
  },
  {
    "name": "Ab Wheel",
    "muscleGroupId": 12
  },
  {
    "name": "Hip Abduction Machine",
    "muscleGroupId": 7
  },
  {
    "name": "Arnold Press",
    "muscleGroupId": 5
  },
  {
    "name": "Lying Dumbbell Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Nordic Curl",
    "muscleGroupId": 8
  },
  {
    "name": "Meadows Row",
    "muscleGroupId": 2
  },
  {
    "name": "Concentration Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Deadlift (Hamstrings Focused)",
    "muscleGroupId": 8
  },
  {
    "name": "Seated Cable Row Single-Arm",
    "muscleGroupId": 2
  },
  {
    "name": "Bayesian Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Pulldown Single-Arm",
    "muscleGroupId": 2
  },
  {
    "name": "EZ Bar Skullcrusher",
    "muscleGroupId": 3
  },
  {
    "name": "Bench Press Close Grip",
    "muscleGroupId": 3
  },
  {
    "name": "Dip Machine",
    "muscleGroupId": 3
  },
  {
    "name": "Standing Calf Raise",
    "muscleGroupId": 9
  },
  {
    "name": "Cable Hammer Curl Rope",
    "muscleGroupId": 4
  },
  {
    "name": "Bodyweight Squat 2/3",
    "muscleGroupId": 6
  },
  {
    "name": "Machine Pulldown",
    "muscleGroupId": 2
  },
  {
    "name": "Single Leg Extension",
    "muscleGroupId": 6
  },
  {
    "name": "Machine Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Cable Chest Press",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Overhead Extension",
    "muscleGroupId": 3
  },
  {
    "name": "Single Leg Romanian Deadlift",
    "muscleGroupId": 8
  },
  {
    "name": "Hip Adduction Machine",
    "muscleGroupId": 7
  },
  {
    "name": "Smith Machine Shrug",
    "muscleGroupId": 10
  },
  {
    "name": "Smith Machine JM Press",
    "muscleGroupId": 3
  },
  {
    "name": "Smith Machine Skullcrusher",
    "muscleGroupId": 3
  },
  {
    "name": "Dumbbell Front Squat",
    "muscleGroupId": 6
  },
  {
    "name": "Trap Bar Deadlift",
    "muscleGroupId": 8
  },
  {
    "name": "Bench Press Decline",
    "muscleGroupId": 1
  },
  {
    "name": "Reverse Curl",
    "muscleGroupId": 11
  },
  {
    "name": "Smith Machine Split Squat",
    "muscleGroupId": 7
  },
  {
    "name": "Front Foot Elevated Smith Lunge",
    "muscleGroupId": 7
  },
  {
    "name": "Reverse Hyper",
    "muscleGroupId": 8
  },
  {
    "name": "Cable Tricep Kickback",
    "muscleGroupId": 3
  },
  {
    "name": "Landmine Row",
    "muscleGroupId": 2
  },
  {
    "name": "Hammer Preacher Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Cable Flye Seated",
    "muscleGroupId": 1
  },
  {
    "name": "Cable Curl Single-Arm",
    "muscleGroupId": 4
  },
  {
    "name": "Dumbbell Flexion Row",
    "muscleGroupId": 2
  },
  {
    "name": "Deadlift Flexion",
    "muscleGroupId": 8
  },
  {
    "name": "Barbell Pullover",
    "muscleGroupId": 2
  },
  {
    "name": "Dual Cable Pullover",
    "muscleGroupId": 2
  },
  {
    "name": "Back Extension Flexion",
    "muscleGroupId": 8
  },
  {
    "name": "Decline Dumbbell Curl",
    "muscleGroupId": 4
  },
  {
    "name": "Donkey Calf Raise",
    "muscleGroupId": 9
  },
  {
    "name": "Smith Machine Press High Incline Wide Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Press High Incline Medium Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Press High Incline Narrow Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Press Medium Incline Narrow Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Press Low Incline Wide Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Press Low Incline Medium Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Smith Machine Press Low Incline Narrow Grip",
    "muscleGroupId": 1
  },
  {
    "name": "Dumbbell Press High Incline",
    "muscleGroupId": 1
  },
  {
    "name": "Deadlift Sumo Stance Deficit",
    "muscleGroupId": 7
  },
  {
    "name": "Rogers Reverse Lunge",
    "muscleGroupId": 7
  },
  {
    "name": "Rogers Good Morning",
    "muscleGroupId": 8
  },
  {
    "name": "Rogers Squat",
    "muscleGroupId": 6
  },
  {
    "name": "Dumbell Lateral Raise Seated",
    "muscleGroupId": 5
  },
  {
    "name": "Barbell Front Raise Overhand",
    "muscleGroupId": 5
  },
  {
    "name": "Cable Front Raise Overhand",
    "muscleGroupId": 5
  }
];

async function main() {
  console.log(`Starting to seed ${exercises.length} exercises...`);
  
  const result = await prisma.exercise.createMany({
    data: exercises,
    skipDuplicates: true,
  });

  console.log(`Successfully seeded ${result.count} exercises!`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
