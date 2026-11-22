import { useContext, useEffect, useState } from "react"
import { X, ArrowLeft, Loader2 } from "lucide-react"
import { muscleNames } from "../components/setComponent"
import { noOfexerciseAndsessionContext } from "../helper/context"
import { Get } from "../src/service/centralisedApi.js"

interface AddExerciseProps {
    setOpenorClose?: (value: boolean) => void
    onClose?: () => void
    sessionId?: number
    rirTarget?: number
    mesocycleId?: number
    weeknumber?: number
    daynumber?: number
    onAddExercise?: (exerciseId: number, sessionId: number, rirTarget?: number, weeknumber?: number, daynumber?: number, mesocycleId?: number) => void
    addExercise?: (exerciseId: number, sessionId: number, rirTarget?: number, weeknumber?: number, daynumber?: number, mesocycleId?: number) => void
    isLoading?: boolean
}

export default function AddExercise({
    setOpenorClose,
    onClose,
    sessionId,
    rirTarget,
    mesocycleId,
    weeknumber,
    daynumber,
    onAddExercise,
    addExercise,
    isLoading = false
}: AddExerciseProps) {
    const [selectedMuscle, setSelectedMuscle] = useState<number | null>(null)
    const [selectedExercise, setSelectedExercise] = useState<any | null>(null)
    const [step, setStep] = useState<1 | 2>(1)
    const [searchQuery, setSearchQuery] = useState("")
    const { allexercise, setAllexercise } = useContext(noOfexerciseAndsessionContext)
    const [loadError, setLoadError] = useState(false)
    const [retryKey, setRetryKey] = useState(0)

    useEffect(() => {
        if (allexercise) return
        setLoadError(false)
        Get("/training/exercises")
            .then((response) => {
                if (!response.ok) throw new Error(`Status: ${response.status}`)
                return response.json()
            })
            .then((result) => setAllexercise(result.exercises))
            .catch(() => setLoadError(true))
    }, [allexercise, retryKey])

    const handleClose = () => {
        if (isLoading) return
        if (setOpenorClose) setOpenorClose(false)
        if (onClose) onClose()
    }

    const filteredExercises = (allexercise ?? [])
        .filter((e: any) => Number(e.muscleGroupId) === selectedMuscle)
        .filter((e: any) => e.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()))

    const handleCreate = () => {
        if (!selectedExercise || !sessionId || isLoading) return
        const addFn = onAddExercise || addExercise
        addFn?.(selectedExercise.id, sessionId, rirTarget, weeknumber, daynumber, mesocycleId)
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl p-6 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {step === 1 ? (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold tracking-tight text-neutral-100">
                                Select Muscle Group
                            </h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close"
                                className="text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto mb-6">
                            {Object.entries(muscleNames).map(([id, name]) => {
                                const muscleId = Number(id)
                                return (
                                    <label
                                        key={id}
                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 text-sm font-medium text-neutral-300 cursor-pointer hover:border-neutral-700 has-[:checked]:border-[#d01e1e] has-[:checked]:text-neutral-100 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name="muscleGroup"
                                            value={muscleId}
                                            checked={selectedMuscle === muscleId}
                                            onChange={() => {
                                                setSelectedMuscle(muscleId)
                                                setSelectedExercise(null)
                                            }}
                                            className="w-4 h-4 shrink-0 accent-[#d01e1e] cursor-pointer"
                                        />
                                        <span>{name}</span>
                                    </label>
                                )
                            })}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 font-medium hover:bg-neutral-900 transition-colors cursor-pointer text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={selectedMuscle === null}
                                onClick={() => setStep(2)}
                                className="flex-1 px-5 py-2.5 rounded-xl bg-[#d01e1e] hover:bg-[#b51919] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors cursor-pointer text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={() => {
                                        setStep(1)
                                        setSearchQuery("")
                                        setSelectedExercise(null)
                                    }}
                                    aria-label="Back"
                                    className="text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer p-1 -ml-1 rounded-lg disabled:opacity-40"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight text-neutral-100">
                                        {selectedMuscle ? muscleNames[selectedMuscle] : "Exercises"}
                                    </h2>
                                    <span className="text-xs text-neutral-500">
                                        {filteredExercises.length} {filteredExercises.length === 1 ? "exercise" : "exercises"} available
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={handleClose}
                                aria-label="Close"
                                className="text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer disabled:opacity-40"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Search exercises..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-600"
                            />
                        </div>

                        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto mb-4">
                            {loadError ? (
                                <div className="text-center py-8">
                                    <p className="text-neutral-500 text-sm">Couldn't load exercises.</p>
                                    <button
                                        type="button"
                                        onClick={() => setRetryKey((key) => key + 1)}
                                        className="mt-3 px-4 py-2 rounded-lg border border-neutral-800 text-neutral-300 text-sm font-medium hover:bg-neutral-900 transition-colors cursor-pointer"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : !allexercise ? (
                                <div className="text-center py-8 text-neutral-500 text-sm">
                                    Loading exercises...
                                </div>
                            ) : filteredExercises.length === 0 ? (
                                <div className="text-center py-8 text-neutral-500 text-sm">
                                    No exercises found
                                </div>
                            ) : (
                                filteredExercises.map((exercise: any) => {
                                    const isSelected = selectedExercise?.id === exercise.id
                                    return (
                                        <button
                                            key={exercise.id}
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => setSelectedExercise(isSelected ? null : exercise)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left text-sm font-medium transition-colors cursor-pointer ${
                                                isSelected
                                                    ? "border-[#d01e1e] bg-[#1a0808] text-white"
                                                    : "border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-700"
                                            }`}
                                        >
                                            <span className="truncate">{exercise.name}</span>
                                            <span
                                                className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                                                    isSelected ? "border-[#d01e1e] bg-[#d01e1e]" : "border-neutral-600"
                                                }`}
                                            >
                                                {isSelected && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                                )}
                                            </span>
                                        </button>
                                    )
                                })
                            )}
                        </div>

                        <div className="flex gap-3">
                            {selectedExercise ? (
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={handleCreate}
                                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#d01e1e] hover:bg-[#b51919] disabled:opacity-50 text-white font-medium transition-colors cursor-pointer text-sm"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        "Create"
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1)
                                        setSearchQuery("")
                                        setSelectedExercise(null)
                                    }}
                                    className="flex-1 px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 font-medium hover:bg-neutral-900 transition-colors cursor-pointer text-sm"
                                >
                                    Back
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
