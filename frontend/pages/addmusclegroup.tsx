import { useState } from "react"
import { X } from "lucide-react"
import { muscleGroup } from "./priorities"

function Addmusclegroup({ setChangeDay, daysBeforeChange, propindex, onClose }: {
    setChangeDay: any,
    daysBeforeChange: any,
    propindex: number,
    onClose: () => void
}) {
    const [selectedMuscle, setMuscle] = useState<number | null>(null)

    function addMuscle() {
        if (selectedMuscle === null) return
        setChangeDay(daysBeforeChange.map((item, index) =>
            index === propindex ? { ...item, muscles: [...item.muscles, selectedMuscle] } : item
        ))
        onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 p-6 border-b border-neutral-800">
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                            Muscle Group
                        </span>
                        <h2 className="text-xl font-semibold tracking-tight text-neutral-100 mt-1">
                            Add to this day
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {Object.entries(muscleGroup).map(([name, id]) => (
                        <label
                            key={id}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 text-sm font-medium text-neutral-300 cursor-pointer hover:border-neutral-700 has-[:checked]:border-[#d01e1e] has-[:checked]:text-neutral-100 transition-colors"
                        >
                            <input
                                type="radio"
                                name="muscle"
                                value={name}
                                checked={selectedMuscle === id}
                                onChange={() => setMuscle(id)}
                                className="w-4 h-4 shrink-0 accent-[#d01e1e] cursor-pointer"
                            />
                            {name}
                        </label>
                    ))}
                </div>

                <div className="flex gap-3 p-6 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-5 py-3 rounded-xl border border-neutral-800 text-neutral-300 font-medium hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={addMuscle}
                        disabled={selectedMuscle === null}
                        className="flex-1 px-5 py-3 rounded-xl bg-[#d01e1e] hover:bg-[#b51919] disabled:opacity-40 text-white font-medium transition-colors cursor-pointer"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Addmusclegroup
