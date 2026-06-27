import { useState, useEffect } from "react"
import { Get } from "../service/centralisedApi.js"
import SetComponent from "../components/Setcomponent"
import Feedback from "../components/Feeback"

type PendingMuscleSelection = {
    muscleName: string
    setsOver: number
}

type Props = {
    setsLeft: number | null
    muscletrained: string
    Selecttrainedmuscle: any
    MUSCLE_COLORS: any
    muscle: string[]
    currentDropdown: number | null
    setCurrentDropdown: React.Dispatch<React.SetStateAction<number | null>>
    isOpen: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    exercise_name: string
    exerciseName: (e: any, id: number) => void
    addset: (exerciseid: number) => void
    deleteSet: (exerciseId: number, setId: number) => void
    deleteExercise: (exerciseId: number) => void
    set: any[]
    id: number
    addsetData: (e: any, exerciseid: number, id: number) => void
    apiCall: Set<unknown>
    setApiCall: React.Dispatch<React.SetStateAction<Set<unknown>>>
    weekId: string
    mesoId: string
    logSoreness: any
    existingSoreness?: any
    /** Returns sets remaining for the given muscle this week, or null if no limit applies. */
    getMuscleSetsLeft: (muscleName: string) => number | null
}

export default function Exercisecomponent({
    muscletrained,
    Selecttrainedmuscle,
    MUSCLE_COLORS,
    muscle,
    currentDropdown,
    setCurrentDropdown,
    isOpen,
    setOpen,
    exercise_name,
    exerciseName,
    addset,
    deleteSet,
    deleteExercise,
    set,
    id,
    addsetData,
    apiCall,
    setApiCall,
    weekId,
    mesoId,
    logSoreness,
    existingSoreness,
    setsLeft,
    getMuscleSetsLeft,
}: Props) {
    const [selected, setSelected] = useState(muscletrained)
    const [showSorenessFeedback, setSorenessFeedback] = useState(false)
    const [sorenessLog, setSorenessLog] = useState<any>(null)
    const [pendingMuscleSelection, setPendingMuscleSelection] = useState<PendingMuscleSelection | null>(null)

    useEffect(() => {
        if (existingSoreness) {
            setSorenessLog({
                level: existingSoreness.soreness_score,
                label: existingSoreness.description,
            })
        }
    }, [existingSoreness])

    useEffect(() => {
        setSelected(muscletrained)
    }, [muscletrained])

    async function fetchSorenessIfNeeded(muscleName: string) {
        if (apiCall.has(muscleName)) return
        setSorenessFeedback(false)
        const result = await Get(
            `/mesoCycle/frequency/muscle?muscleName=${encodeURIComponent(muscleName)}&weekId=${weekId}&mesoId=${mesoId}`
        )
        if (!result.ok) {
            throw new Error(`Failed to fetch soreness feedback: ${result.status}`)
        }
        const data = await result.json()
        setSorenessFeedback(data.showSorenessFeedback)
        setApiCall(prev => new Set(prev).add(muscleName))
    }

    /** Commits the muscle selection: fetches soreness data, updates local + shared state. */
    function applyMuscleSelection(muscleName: string) {
        fetchSorenessIfNeeded(muscleName)
        setSelected(muscleName)
        Selecttrainedmuscle(id, muscleName)
    }

    /**
     * Called when the user clicks a muscle in the dropdown.
     * Deselects if same muscle, warns if over-target, otherwise applies immediately.
     */
    function handleMuscleSelect(clickedMuscleName: string) {
        // Deselect if the user clicks the already-selected muscle
        if (selected === clickedMuscleName) {
            setSelected("")
            Selecttrainedmuscle(id, "")
            return
        }

        // Warn before confirming a selection that would exceed the weekly volume target.
        // getMuscleSetsLeft returns the remaining sets WITHOUT the current exercise's sets
        // counted, so comparing against set.length is the correct check.
        const remainingSets = getMuscleSetsLeft(clickedMuscleName)
        if (remainingSets !== null && set.length > remainingSets) {
            setPendingMuscleSelection({
                muscleName: clickedMuscleName,
                setsOver: set.length - remainingSets,
            })
            return
        }

        applyMuscleSelection(clickedMuscleName)
    }

    function confirmPendingMuscleSelection() {
        if (!pendingMuscleSelection) return
        applyMuscleSelection(pendingMuscleSelection.muscleName)
        setPendingMuscleSelection(null)
    }

    function cancelPendingMuscleSelection() {
        setPendingMuscleSelection(null)
    }

    // True when the current exercise is already over the weekly target for its muscle
    const isOverTarget = muscletrained !== "" && setsLeft !== null && setsLeft < 0

    return (
        <div className="mb-3">
            <div className="border border-[#222] rounded-[10px] bg-[#0c0c0c]">
                <div className="p-5">

                    {/* Exercise name + delete */}
                    <div className="border-gray-400 flex items-center gap-3">
                        <input
                            placeholder="exercise name"
                            onChange={(e) => exerciseName(e, id)}
                            value={exercise_name}
                            name="exercise_name"
                            className="outline-none h-5 font-bold tracking-[0.12em] w-full text-xs uppercase font-spaceMono appearance-none border-none"
                        />
                        <button
                            onClick={() => deleteExercise(id)}
                            className="border border-[#2a2a2a] rounded-[8px] px-3 py-2 text-[10px] tracking-[0.12em] text-[#9ca3af] transition-colors duration-150 hover:text-red-400 hover:border-red-400 cursor-pointer"
                        >
                            DELETE EXERCISE
                        </button>
                    </div>

                    {/* Muscle selector */}
                    <div className="relative text-[10px] pb-3 mt-1 tracking-[0.12em] text-[#555] uppercase font-spaceMono select-none">
                        <span onClick={() => { setOpen(!isOpen); setCurrentDropdown(id) }}>
                            Muscle trained
                        </span>

                        {selected !== "" && (
                            <button
                                className="ml-2 text-[10px] border rounded-lg font-spaceMono tracking-[0.06em] py-[4px] px-[10px] rounded-[3px] cursor-pointer transition duration-150"
                                style={{ borderColor: MUSCLE_COLORS[selected] }}
                            >
                                {selected}
                            </button>
                        )}

                        {sorenessLog && (
                            <div className="mt-2 p-4 border border-[rgb(201,106,0)] rounded-lg">
                                {/* @ts-ignore */}
                                <p>
                                    <span className="font-bold text-[rgb(245,160,48)]">Soreness logged:</span>{" "}
                                    Score-{sorenessLog.level} {sorenessLog.label}
                                </p>
                            </div>
                        )}

                        {/* Over-target inline warning — appears reactively as sets are added */}
                        {isOverTarget && (
                            <p className="mt-2 text-orange-400 tracking-[0.08em]">
                                {Math.abs(setsLeft!)} {Math.abs(setsLeft!) === 1 ? "set" : "sets"} over weekly target
                            </p>
                        )}

                        {/* Muscle dropdown */}
                        {isOpen && id === currentDropdown && (
                            <div className="absolute z-10 bg-[#0c0c0c] border border-[#222] rounded-[5px] p-3 flex gap-3 flex-wrap">
                                {pendingMuscleSelection ? (
                                    /* Over-limit confirmation — shown instead of the muscle list */
                                    <div className="basis-full p-3 border border-orange-500/30 rounded-[8px] bg-orange-500/10">
                                        <p className="text-orange-400 text-[11px] mb-3 leading-relaxed">
                                            <span className="font-bold uppercase">{pendingMuscleSelection.muscleName}</span> is{" "}
                                            <span className="font-bold">{pendingMuscleSelection.setsOver}</span>{" "}
                                            {pendingMuscleSelection.setsOver === 1 ? "set" : "sets"} over the weekly target. Continue anyway?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={confirmPendingMuscleSelection}
                                                className="text-[10px] border border-orange-500/60 text-orange-400 py-[6px] px-3 rounded-[5px] cursor-pointer hover:bg-orange-500/20 transition-colors duration-150"
                                            >
                                                Keep sets &amp; continue
                                            </button>
                                            <button
                                                onClick={cancelPendingMuscleSelection}
                                                className="text-[10px] border border-[#333] text-[#9ca3af] py-[6px] px-3 rounded-[5px] cursor-pointer hover:border-[#555] transition-colors duration-150"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal muscle selection list */
                                    <>
                                        {muscle.map(musclename => (
                                            <button
                                                key={musclename}
                                                onClick={() => handleMuscleSelect(musclename)}
                                                className="text-[10px] border rounded-lg font-spaceMono tracking-[0.06em] py-[10px] px-[10px] rounded-[3px] cursor-pointer transition duration-150 border text-gray-[400]"
                                                style={{ borderColor: selected === musclename ? MUSCLE_COLORS[musclename] : "#222" }}
                                            >
                                                {musclename}
                                            </button>
                                        ))}
                                        <div className="basis-full">
                                            {showSorenessFeedback && (
                                                <Feedback
                                                    sorenessLog={sorenessLog}
                                                    musclename={selected}
                                                    setSorenessLog={(data: any) => {
                                                        setSorenessLog(data)
                                                        logSoreness(id, data)
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sets area */}
                    <div className="min-h-30 border border-[#222] rounded-[10px] py-5 px-6 bg-[#0c0c0c]">
                        <div>
                            {set.length === 0 ? (
                                <div className="w-full flex justify-center items-center h-full">
                                    <p>Add your first set</p>
                                </div>
                            ) : (
                                set.map((s: any) => (
                                    <SetComponent
                                        key={s.id}
                                        exerciseid={id}
                                        setdata={s}
                                        addsetData={addsetData}
                                        deleteSet={deleteSet}
                                    />
                                ))
                            )}
                        </div>
                        <div className="flex flex-col items-center mt-3 gap-1">
                            <button
                                className="text-xs font-spaceMono cursor-pointer"
                                onClick={() => addset(id)}
                            >
                                + ADD SET
                            </button>
                            {/* Hint shown only when no muscle has been selected yet */}
                            {muscletrained === "" && (
                                <p className="text-[10px] font-spaceMono text-[#444]">
                                    Select a muscle to track volume
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
