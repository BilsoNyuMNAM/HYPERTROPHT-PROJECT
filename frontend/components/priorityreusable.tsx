import React from "react"
import { X, Plus, GripVertical } from "lucide-react"

const muscleDotColors: Record<string, string> = {
    Chest: "bg-[#d946ef]",
    Back: "bg-[#06b6d4]",
    Triceps: "bg-[#d946ef]",
    Biceps: "bg-[#0ea5e9]",
    Shoulders: "bg-[#d946ef]",
    Quads: "bg-[#10b981]",
    Glutes: "bg-[#10b981]",
    Hamstrings: "bg-[#10b981]",
    Calves: "bg-[#8b5cf6]",
    Traps: "bg-[#8b5cf6]",
    Forearms: "bg-[#8b5cf6]",
    Abs: "bg-[#8b5cf6]",
}

const muscleRecovery: Record<string, string> = {
    Chest: "MODERATE RECOVERY",
    Back: "MODERATE RECOVERY",
    Triceps: "MODERATE RECOVERY",
    Biceps: "FAST RECOVERY",
    Shoulders: "FAST RECOVERY",
    Quads: "HIGH RECOVERY",
    Glutes: "MODERATE RECOVERY",
    Hamstrings: "HIGH RECOVERY",
    Calves: "FAST RECOVERY",
    Traps: "FAST RECOVERY",
    Forearms: "FAST RECOVERY",
    Abs: "FAST RECOVERY",
}

interface PriorityUiProps {
    selectedMuscle: number[]
    isMuscleListOpen: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    muscleslist: Record<string, number>
    priorityType: number[]
    addMusleFunction: React.Dispatch<React.SetStateAction<number[]>>
    tabLabel?: string
    heading?: string
}

function PriorityUi({
    selectedMuscle,
    isMuscleListOpen,
    setOpen,
    muscleslist,
    priorityType,
    addMusleFunction,
    tabLabel = "Emphasize",
    heading = "Rank your focus muscles",
}: PriorityUiProps) {
    const muscles = Object.entries(muscleslist) as [string, number][]

   

   

    const removeMuscle = (muscleId: number) => {
        addMusleFunction(priorityType.filter((id) => id !== muscleId))
    }

    const availableMuscles = muscles.filter(
        ([, id]) => !selectedMuscle.includes(Number(id))
    )

    return (
        <div className="w-full flex flex-col flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f1f]">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#ededed]">
                        {heading}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(!isMuscleListOpen)}
                    className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border border-[#2e2e2e] bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] hover:border-[#404040] transition-colors cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5 text-[#f97316]" />
                    <span>Add muscle</span>
                </button>
            </div>

            {isMuscleListOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-[#121212] border border-[#262626] rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.85)] max-w-xl w-full p-5 sm:p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
                            <div>
                                <h3 className="text-base font-semibold text-[#ededed] tracking-tight">
                                    Add muscle to {tabLabel}
                                </h3>
                                <p className="text-xs text-[#737373] mt-0.5">
                                    Choose muscle groups to allocate to this priority tier
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="text-[#737373] hover:text-[#ededed] transition-colors p-1.5 rounded-md hover:bg-[#1f1f1f] cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-4 max-h-[340px] overflow-y-auto pr-1">
                            {availableMuscles.map(([name, id]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => {
                                        addMusleFunction([...priorityType, Number(id)])
                                    }}
                                    className="flex items-center justify-between px-3.5 py-2.5 bg-[#181818] hover:bg-[#222222] border border-[#262626] hover:border-[#383838] rounded-lg transition-colors cursor-pointer text-left group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                                muscleDotColors[name] || "bg-[#06b6d4]"
                                            }`}
                                        />
                                        <span className="text-sm font-medium text-[#ededed] group-hover:text-white">
                                            {name}
                                        </span>
                                    </div>
                                    <span className="text-base font-light text-[#f97316] leading-none">
                                        +
                                    </span>
                                </button>
                            ))}
                        </div>

                        {availableMuscles.length === 0 && (
                            <div className="text-center py-8 text-xs text-[#737373]">
                                All muscles have already been allocated across priorities.
                            </div>
                        )}

                        <div className="mt-5 pt-3 border-t border-[#222222] flex justify-end">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#ededed] border border-[#333333] transition-colors cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col mt-6 flex-1 min-h-[260px]">
                {priorityType.length === 0 ? (
                    <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center border border-dashed border-[#222222] rounded-xl p-8 text-center bg-[#0d0d0d]/40">
                        <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mb-3 text-[#737373]">
                            <Plus className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-[#a1a1a1]">
                            No muscles added to {tabLabel.toLowerCase()} yet
                        </p>
                        <p className="text-xs text-[#525252] mt-1 max-w-xs">
                            Click "+ Add muscle" above to allocate muscle groups to this priority tier.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {priorityType.map((muscleId) => {
                            const muscleName =
                                muscles.find(([, val]) => val === muscleId)?.[0] || "Unknown"

                            return (
                                <div
                                    key={muscleId}
                                    className="flex items-center justify-between px-4 py-3.5 bg-[#121212] border border-[#262626] rounded-lg shadow-sm hover:border-[#383838] transition-colors"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <GripVertical className="w-4 h-4 text-[#525252] shrink-0" />

                                        <div className="w-7 h-7 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0">
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full ${
                                                    muscleDotColors[muscleName] || "bg-[#06b6d4]"
                                                }`}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[#ededed] leading-tight">
                                                {muscleName}
                                            </span>
                                            <span className="text-[10px] font-mono tracking-wider text-[#737373] uppercase mt-0.5">
                                                {muscleRecovery[muscleName] || "MODERATE RECOVERY"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-[#737373]">
                                        <button
                                            type="button"
                                            onClick={() => removeMuscle(muscleId)}
                                            className="p-1.5 hover:text-[#ef4444] transition-colors ml-1 rounded cursor-pointer"
                                            aria-label="Delete"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PriorityUi
