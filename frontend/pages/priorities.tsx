import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import PriorityUi from "../components/priorityreusable"
import { noOfexerciseAndsessionContext } from "../helper/context"

type muscleiD = {
    Chest: number
    Back: number
    Triceps: number
    Biceps: number
    Shoulders: number
    Quads: number
    Glutes: number
    Hamstrings: number
    Calves: number
    Traps: number
    Forearms: number
    Abs: number
}

export const muscleGroup: muscleiD = {
    Chest: 1,
    Back: 2,
    Triceps: 3,
    Biceps: 4,
    Shoulders: 5,
    Quads: 6,
    Glutes: 7,
    Hamstrings: 8,
    Calves: 9,
    Traps: 10,
    Forearms: 11,
    Abs: 12,
}
//@ts-ignore
enum RecoveryRate{
    Slow = "slow",
    Moderate = "moderate",
    Fast = "fast"
}
export const MUSCLE_RECOVERY_RATE: Record<number, RecoveryRate> = {
    [muscleGroup.Chest]: RecoveryRate.Slow,
    [muscleGroup.Back]: RecoveryRate.Moderate,
    [muscleGroup.Triceps]: RecoveryRate.Moderate,
    [muscleGroup.Biceps]: RecoveryRate.Fast,
    [muscleGroup.Shoulders]: RecoveryRate.Fast,
    [muscleGroup.Quads]: RecoveryRate.Slow,
    [muscleGroup.Glutes]: RecoveryRate.Slow,
    [muscleGroup.Hamstrings]: RecoveryRate.Slow,
    [muscleGroup.Calves]: RecoveryRate.Moderate,
    [muscleGroup.Traps]: RecoveryRate.Fast,
    [muscleGroup.Forearms]: RecoveryRate.Fast,
    [muscleGroup.Abs]: RecoveryRate.Moderate,
}

const options = [
    { label: "Emphasize", description: "More volume", order: "01", heading: "Rank your focus muscles" },
    { label: "Grow", description: "Steady growth", order: "02", heading: "Rank your growth muscles" },
    { label: "Maintain", description: "Hold ground", order: "03", heading: "Rank your maintenance muscles" },
]

function Musclepriority() {
    const navigate = useNavigate()
    const { setCalculated, emphasisMuscle, setEmphasizemuscle, growMuscle, setGrowmuscle, maintainMuscle, setMaintainmuscle } = useContext(noOfexerciseAndsessionContext)
    const [activeTab, setActivetab] = useState<string>(options[0].order)
    const [isMuscleListOpen, setOpen] = useState<boolean>(false)

    const selectedMuscle = [...emphasisMuscle, ...growMuscle, ...maintainMuscle]
    const isDisable = selectedMuscle.length === 12


    //session look_up table 
    const sessionCount = {
        slow:{
            top:2,
            bottom:2,
            grow:1,
            maintain:1
        },
        moderate:{
            top:3,
            bottom:2,
            grow:2,
            maintain:2
        },
        fast:{
            top:4,
            bottom:3,
            grow:2,
            maintain:2
        }
    }

    function TotalSession(priority:string, muscleId:number ){
        const recovery = MUSCLE_RECOVERY_RATE[muscleId]
        //@ts-ignore
        const session = sessionCount[recovery][priority]
        return session
    }
    
    //how many exercise look_up table
    const exerciseCount: Record<number, Record<string, number>> = {
        1: {
            top: 0,
            bottom: 0,
            grow: 1,
            maintain: 1
        },
        2: {
            top: 4,
            bottom: 3,
            grow: 2,
            maintain: 2
        },
        3: {
            top: 6,
            bottom: 5,
            grow: 3,
            maintain: 3
        },
        4: {
            top: 8,
            bottom: 6,
            grow: 4,
            maintain: 4
        }
    }

    function TotalExercise(sessioncount: number, priority: string) {
        const totalexercise = exerciseCount[sessioncount]?.[priority] ?? 2
        return totalexercise
    }
    const sessionAndexercise = {
        emphasisTop: {},
        emphasisBottom: {},
        grow: {},
        maintain: {}
    }

    function calculateCount(growMuscle: number[], maintainMuscle: number[], emphasisMuscle: number[]) {
        for (let i = 0; i < growMuscle.length; i++) {
            const sessionsPerMuscle = TotalSession("grow", growMuscle[i])
            const exercisePerMuscle = TotalExercise(sessionsPerMuscle, "grow")
            //@ts-ignore
            sessionAndexercise.grow[growMuscle[i]] = {
                sessionsCount: sessionsPerMuscle,
                exerciseCount: exercisePerMuscle
            }
        }

        for (let i = 0; i < maintainMuscle.length; i++) {
            const sessionsPerMuscle = TotalSession("maintain", maintainMuscle[i]);
            const exercisePerMuscle = TotalExercise(sessionsPerMuscle, "maintain");
            //@ts-ignore
            sessionAndexercise.maintain[maintainMuscle[i]] = {
                sessionsCount: sessionsPerMuscle,
                exerciseCount: exercisePerMuscle
            };
        }   
        for (let i = 0; i < emphasisMuscle.length; i++) {
            // Official RP Logic: First half gets Top, remainder gets Bottom.
            // If length === 1, Math.floor(1 / 2) = 0. Since 0 < 0 is false, 1 muscle gets Bottom emphasis.
            const isTop = i < Math.floor(emphasisMuscle.length / 2);
            const priorityKey = isTop ? "top" : "bottom";
            const targetCategory = isTop ? "emphasisTop" : "emphasisBottom";

            const sessionsPerMuscle = TotalSession(priorityKey, emphasisMuscle[i]);
            const exercisePerMuscle = TotalExercise(sessionsPerMuscle, priorityKey);

            //@ts-ignore
            sessionAndexercise[targetCategory][emphasisMuscle[i]] = {
                sessionsCount: sessionsPerMuscle,
                exerciseCount: exercisePerMuscle
            };
        }
    }








    const handleContinue = () => {
        if (isDisable) {
            calculateCount(growMuscle, maintainMuscle, emphasisMuscle)
            setCalculated(sessionAndexercise)
            console.log(sessionAndexercise)
            navigate("/mesocycles/new")
        }
    }

    const currentOption = options.find((opt) => opt.order === activeTab) || options[0]

    return (
        <div className="min-h-screen bg-[#000000] text-[#ededed] py-8 sm:py-12 px-4 sm:px-6 font-sans flex flex-col items-center">
            <div className="w-full max-w-3xl flex flex-col">
                <div className="w-full bg-[#0a0a0a] border border-[#222222] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                    <div className="grid grid-cols-3 border-b border-[#222222] bg-[#0d0d0d]">
                        {options.map((option) => {
                            const isActive = activeTab === option.order

                            return (
                                <button
                                    key={option.order}
                                    type="button"
                                    onClick={() => {
                                        setActivetab(option.order)
                                        setOpen(false)
                                    }}
                                    className={`relative flex flex-col items-start p-4 sm:px-6 sm:py-5 transition-colors cursor-pointer border-r last:border-r-0 border-[#222222] text-left ${
                                        isActive
                                            ? "bg-[#141414] text-[#ededed]"
                                            : "bg-[#0a0a0a] hover:bg-[#111111] text-[#737373] hover:text-[#a1a1a1]"
                                    }`}
                                >
                                    {isActive && (
                                        <span className="absolute top-0 left-0 right-0 h-[3px] bg-[#f97316]" />
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-xs font-mono font-medium ${
                                                isActive ? "text-[#f97316]" : "text-[#737373]"
                                            }`}
                                        >
                                            {option.order}
                                        </span>
                                        <span className="text-sm sm:text-base font-semibold leading-tight">
                                            {option.label}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider mt-1 text-[#737373]">
                                        {option.description}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="p-6 sm:p-8 min-h-[460px] flex flex-col justify-between">
                        {activeTab === "01" ? (
                            <PriorityUi
                                isMuscleListOpen={isMuscleListOpen}
                                setOpen={setOpen}
                                muscleslist={muscleGroup}
                                priorityType={emphasisMuscle}
                                addMusleFunction={setEmphasizemuscle}
                                selectedMuscle={selectedMuscle}
                                tabLabel={currentOption.label}
                                heading={currentOption.heading}
                            />
                        ) : activeTab === "02" ? (
                            <PriorityUi
                                isMuscleListOpen={isMuscleListOpen}
                                setOpen={setOpen}
                                muscleslist={muscleGroup}
                                priorityType={growMuscle}
                                addMusleFunction={setGrowmuscle}
                                selectedMuscle={selectedMuscle}
                                tabLabel={currentOption.label}
                                heading={currentOption.heading}
                            />
                        ) : (
                            <PriorityUi
                                isMuscleListOpen={isMuscleListOpen}
                                setOpen={setOpen}
                                muscleslist={muscleGroup}
                                priorityType={maintainMuscle}
                                addMusleFunction={setMaintainmuscle}
                                selectedMuscle={selectedMuscle}
                                tabLabel={currentOption.label}
                                heading={currentOption.heading}
                            />
                        )}
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#737373] hover:text-[#ededed] transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        disabled={!isDisable}
                        onClick={handleContinue}
                        className={
                            isDisable
                                    ? "w-full py-4 rounded-lg font-bold text-sm tracking-wider uppercase text-white bg-[#e52525] hover:bg-[#d01e1e] active:scale-[0.99] transition-all duration-150 shadow-lg shadow-red-950/30 cursor-pointer"

                                : "w-full py-4 rounded-lg font-bold text-sm tracking-wider uppercase bg-[#171717] text-[#525252] border border-[#262626] cursor-not-allowed shadow-none transition-colors"
                        }
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Musclepriority
