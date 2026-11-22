import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Get } from "../src/service/centralisedApi.js"
import { muscleGroup } from "../pages/priorities"

interface SummaryModalProps {
    mesocycleId: string
    onClose: () => void
}

export default function SummaryModal({ mesocycleId, onClose }: SummaryModalProps) {
    const [volume, setVolume] = useState<Record<string, number[]> | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        Get(`/mesocycles/${mesocycleId}/volume`)
            .then(async (response: Response) => {
                if (!response.ok) {
                    const body = await response.json().catch(() => ({}))
                    throw new Error(body.message ?? "Failed to load volume")
                }
                return response.json()
            })
            .then((json: Record<string, number[]>) => {
                if (!cancelled) setVolume(json)
            })
            .catch((err: Error) => {
                if (!cancelled) setError(err.message)
            })
        return () => {
            cancelled = true
        }
    }, [mesocycleId])

    const weeks = volume ? Object.keys(volume).map(Number) : []
    // highest single-week value sets the bar scale
    const max = Math.max(1, ...(volume ? weeks.flatMap((week) => volume[week] ?? []) : []))

    const gridTemplate = `6.5rem repeat(${weeks.length}, minmax(2rem, 1fr))`

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-xl mx-4 max-h-[85vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl text-white transform transition-all animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight">Muscle group stats</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                        aria-label="Close summary"
                    >
                        <X size={18} />
                    </button>
                </div>

                {error && <p className="text-sm text-neutral-400">{error}</p>}
                {!error && !volume && <p className="text-sm text-neutral-400">Loading...</p>}

                {volume && (
                    <div className="overflow-x-auto">
                        <div
                            className="grid gap-2 mb-3 items-end"
                            style={{ gridTemplateColumns: gridTemplate }}
                        >
                            <span />
                            {weeks.map((week) => (
                                <span
                                    key={week}
                                    className="text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500"
                                >
                                    {week === weeks.length ? "DL" : `wk ${week}`}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4">
                            {Object.entries(muscleGroup).map(([name, id]) => {
                                const values = weeks.map((week) => volume[week]?.[id - 1] ?? 0)
                                const avg = values.reduce((acc, value) => acc + value, 0) / (values.length || 1)

                                return (
                                    <div
                                        key={name}
                                        className="grid gap-2 items-end"
                                        style={{ gridTemplateColumns: gridTemplate }}
                                    >
                                        <div className="pr-2">
                                            <div className="text-sm font-semibold text-neutral-100">{name}</div>
                                            <div className="text-[11px] text-neutral-500">
                                                {Number(avg.toFixed(1))} avg sets
                                            </div>
                                        </div>

                                        {values.map((value, index) => (
                                            <div key={index} className="flex flex-col justify-end h-16">
                                                <div
                                                    className="flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-800 text-[11px] font-medium text-neutral-100"
                                                    style={{
                                                        height:
                                                            value === 0
                                                                ? 22
                                                                : 22 + (value / max) * 42,
                                                    }}
                                                >
                                                    {value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
