import { useContext, useEffect, useState } from "react"
import { noOfexerciseAndsessionContext } from "../helper/context"
import { Get } from "../src/service/centralisedApi.js"

// module-level guard so only the first mounted card fetches, not one request per card
let exercisesFetchStarted = false
export const muscleNames: Record<number, string> = {
    1: "Chest",
    2: "Back",
    3: "Triceps",
    4: "Biceps",
    5: "Shoulders",
    6: "Quads",
    7: "Glutes",
    8: "Hamstrings",
    9: "Calves",
    10: "Traps",
    11: "Forearms",
    12: "Abs",
}

const row = "grid grid-cols-[2.5rem_1fr_1fr_2rem_1.75rem] gap-3 items-center"

export default function Setcard({ exerciseData, updateSet, competeSet, deleteSet, addSet, replaceExercise }: { exerciseData: any, updateSet:any, competeSet:any, deleteSet:any, addSet:any, replaceExercise:any }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const { allexercise, setAllexercise } = useContext(noOfexerciseAndsessionContext)
    const [filterMuscle, setFilterMuscle] = useState<number | null>(null)
    const [query, setQuery] = useState("")
    const [exerciseError, setExerciseError] = useState(false)

    useEffect(() => {
        if (allexercise || exercisesFetchStarted) return
        exercisesFetchStarted = true
        setExerciseError(false)
        Get("/training/exercises")
            .then((response) => {
                if (!response.ok) throw new Error(`Status: ${response.status}`)
                return response.json()
            })
            .then((result) => setAllexercise(result.exercises))
            .catch(() => {
                exercisesFetchStarted = false // allow retry on next mount/open
                setExerciseError(true)
            })
    }, [allexercise])

    const exercisesLoading = !allexercise && !exerciseError

    

    function Filterexercise(muscleID:number){
        setFilterMuscle(muscleID)
    }


    const searched = (allexercise ?? []) //derived, so it is never stale and safe before the fetch resolves
        .filter((e: any) => filterMuscle == null || e.muscleGroupId == filterMuscle)
        .filter((e: any) => e.name.toLowerCase().includes(query.trim().toLowerCase()))

    return (
        <section className="rounded-xl border border-[#222222] bg-[#0a0a0a] px-4 py-4">
            <div className="flex items-start justify-between">
                <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-500">
                {muscleNames[exerciseData.exercise.muscleGroupId]}
            </div>
            <h2 className="mt-1 text-base font-semibold leading-snug text-[#ededed]">
                {exerciseData.exercise.name}
            </h2>
                </div>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1 text-[#5a5a5a] transition-colors hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60 rounded"
                        aria-label="Exercise options"
                    >
                        ⋯
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-44 rounded-lg border border-[#222222] bg-[#141414] py-1 shadow-lg z-10">
                            <button
                                type="button"
                                onClick={() => {
                                    Filterexercise(exerciseData.exercise.muscleGroupId)
                                    setPickerOpen(true)
                                    setMenuOpen(false)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-[#ededed] hover:bg-[#1f1f1f] transition-colors"
                            >
                                Replace exercise
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {pickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => { setPickerOpen(false); setQuery("") }}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        className="relative bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md max-h-[75vh] flex flex-col overflow-hidden shadow-2xl cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 pt-5 pb-3">
                            <h2 className="text-xl font-semibold text-neutral-100">Exercises</h2>
                            <button type="button" onClick={() => { setPickerOpen(false); setQuery("") }} className="text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer">✕</button>
                        </div>
                        <div className="px-5 pb-4 border-b border-neutral-800">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search"
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-600"
                            />
                            <span className="inline-block mt-3 text-[10px] font-mono uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-full px-2.5 py-1">
                                {muscleNames[exerciseData.exercise.muscleGroupId]}
                            </span>
                        </div>
                        <div className="overflow-y-auto flex flex-col">
                            {exerciseError ? (
                                <span className="text-xs text-neutral-600 px-5 py-6">Couldn't load exercises. Close and reopen to retry.</span>
                            ) : exercisesLoading ? (
                                <span className="text-xs text-neutral-600 px-5 py-6">Loading exercises…</span>
                            ) : searched.length === 0 ? (
                                <span className="text-xs text-neutral-600 px-5 py-6">No exercises found</span>
                            ) : (
                                searched.map((exercise: any) => (
                                    <button
                                        key={exercise.id}
                                        type="button"
                                        onClick={() => {
                                            replaceExercise(exerciseData.exerciseId, exercise)
                                            setPickerOpen(false)
                                            setQuery("")
                                        }}
                                        className={`flex items-center gap-3 px-5 py-3.5 text-left border-b border-neutral-900 hover:bg-neutral-900 transition-colors cursor-pointer ${exerciseData.exerciseId === exercise.id ? "bg-neutral-900" : ""}`}
                                    >
                                        <span className={`w-4 h-4 rounded-full border flex-shrink-0 ${exerciseData.exerciseId === exercise.id ? "border-neutral-200 bg-neutral-200" : "border-neutral-700"}`} />
                                        <span className="text-sm text-neutral-200 truncate">{exercise.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <div className={`${row} mt-4 border-t border-[#1a1a1a] pt-3 pb-1 text-[10px] font-semibold tracking-[0.1em] text-[#5a5a5a]`}>
                <div>SET</div>
                <div>WEIGHT</div>
                <div>REPS</div>
                <div>LOG</div>
                <div />
            </div>

            <div className="flex flex-col gap-1.5">
                {exerciseData.set.map((eachset: any, index: number) => {
                    return (
                        <div key={eachset.id} className={row}>
                            <span className="flex items-center gap-1 text-sm text-[#8a8a8a] tabular-nums">
                                <span className="cursor-grab text-[#333333]">⋮</span>
                                <span>{index+1}</span>
                            </span>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="kg"
                                aria-label={`Weight for set ${index+1}`}
                                className="w-full rounded-lg border border-[#1f1f1f] bg-[#141414] px-2 py-2 text-center text-sm text-[#ededed] placeholder:text-[#5a5a5a] outline-none transition-colors hover:border-[#2a2a2a] focus:border-[#333333] focus:bg-[#191919] focus:ring-2 focus:ring-red-600/40"
                                value={eachset.weight==null?"":eachset.weight}
                                name="weight"
                                onChange={(e)=>{updateSet(eachset.id, e.target.name, e.target.value)}}
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={eachset.rirTarget != null ? `${eachset.rirTarget} RIR` : ""}
                                aria-label={`Reps for set ${index+1}`}
                                className="w-full rounded-lg border border-[#1f1f1f] bg-[#141414] px-2 py-2 text-center text-sm text-[#ededed] placeholder:text-[#5a5a5a] outline-none transition-colors hover:border-[#2a2a2a] focus:border-[#333333] focus:bg-[#191919] focus:ring-2 focus:ring-red-600/40"
                                value={eachset.reps==null?"":eachset.reps}
                                name="reps"
                                 onChange={(e)=>{updateSet(eachset.id, e.target.name, e.target.value)}}
                            />
                            <input
                                type="checkbox"
                                checked={eachset.status === "completed"}
                                onChange={()=>{ competeSet(eachset.id)}}
                                aria-label={`Log set ${index+1}`}
                                className="h-5 w-5 cursor-pointer accent-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                            />
                            <button
                                type="button"
                                onClick={() => deleteSet(eachset.id, exerciseData.id)}
                                disabled={exerciseData.set.length === 1}
                                aria-label={`Delete set ${index+1}`}
                                className="justify-self-center text-base leading-none text-[#5a5a5a] transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60"
                            >
                                ×
                            </button>
                        </div>
                    )
                })}
            </div>

            <button
                type="button"
                onClick={() => addSet(exerciseData.id)}
                className="mt-2 w-full rounded-lg border border-dashed border-[#222222] py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a8a8a] transition-colors hover:border-[#333333] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60"
            >
                + Add set
            </button>
        </section>
    )
}
