import { X } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface CalendarModalProps {
    onClose: () => void
    sessions: any[]
    totalWeeks: number
    currentWeek: number
    currentDay: number
    mesocycleId: string
}

export default function CalendarModal({
    onClose,
    sessions,
    totalWeeks,
    currentWeek,
    currentDay,
    mesocycleId,
}: CalendarModalProps) {
    const navigate = useNavigate()
    const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1)

 
    const dayRows = sessions.filter((s: any) => s.weeknumber === 1) //all week label are similar so 1 will work fine

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            
            <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl text-white transform transition-all animate-in fade-in zoom-in-95 duration-200">
                
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight">Weeks</h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 ml-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                            aria-label="Close calendar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div
                    className="grid gap-3 mb-4 text-center"
                    style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}
                >
                    {weeks.map((weekNum) => {
                        const isDeload = weekNum === totalWeeks
                        return (
                            <div key={weekNum} className="flex flex-col items-center">
                                <span className="text-sm font-semibold text-neutral-200">
                                    {isDeload ? "DL" : `Week ${weekNum}`}
                                </span>
                            </div>
                        )
                    })}
                </div>

               
                <div className="flex flex-col gap-3">
                    {dayRows.map((dayRow: any) => (
                        <div
                            key={dayRow.daynumber}
                            className="grid gap-3"
                            style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}
                        >
                            {weeks.map((weekNum) => {
                                const session = sessions.find(
                                    (s: any) =>
                                        s.weeknumber === weekNum &&
                                        s.daynumber === dayRow.daynumber
                                )
                                const isActive =
                                    weekNum === currentWeek &&
                                    dayRow.daynumber === currentDay
                                const isCompleted = session?.status === "completed"

                                return (
                                    <button
                                        key={weekNum}
                                        type="button"
                                        onClick={() => {
                                            navigate(
                                                `/mesocycles/${mesocycleId}/week/${weekNum}/days/${dayRow.daynumber}`
                                            )
                                            onClose()
                                        }}
                                        className={`relative py-3 rounded-xl text-sm font-medium transition-all text-center border ${
                                            isActive
                                                ? "bg-neutral-800 border-neutral-400 text-white shadow-sm ring-1 ring-neutral-400"
                                                : isCompleted
                                                ? "bg-neutral-800/90 border-green-700/60 text-green-300 hover:bg-neutral-700/80"
                                                : "bg-neutral-800/80 hover:bg-neutral-700/80 border-neutral-800 text-neutral-300 hover:text-white"
                                        }`}
                                    >
                                        {session?.label ?? dayRow.label}

                                        {isActive && (
                                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                        {isCompleted && !isActive && (
                                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
