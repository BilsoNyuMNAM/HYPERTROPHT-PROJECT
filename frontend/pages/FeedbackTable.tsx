import { useState, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { 
    Calendar, 
    Filter, 
    ArrowLeft, 
    Search, 
    Activity, 
    Flame, 
    Dumbbell, 
    HeartPulse, 
    RefreshCw, 
    Layers, 
    SlidersHorizontal,
    ChevronRight,
    Info
} from "lucide-react"

export interface FeedbackItem {
    id: number
    sessionId: number
    muscleGroupId: number
    muscleName: string
    soreness: number
    workload: number
    pump: number
    jointpain: number
    weeknumber: number
    daynumber: number
    dayLabel: string
    sessionStatus: string
}

export interface FeedbackApiResponse {
    mesocycle: {
        id: number
        mesoname: string
        length: number
    }
    availableWeeks: number[]
    selectedWeek: number | "all"
    totalCount: number
    feedbacks: FeedbackItem[]
}

const SORENESS_MAP: Record<number, { label: string; badgeClass: string; valueTag: string }> = {
    [-1]: { 
        label: "First session (Not rated)", 
        badgeClass: "bg-[#1f1f1f] text-[#8a8a8a] border-[#333333]", 
        valueTag: "-1" 
    },
    0: { 
        label: "Never got sore", 
        badgeClass: "bg-emerald-950/50 text-emerald-300 border-emerald-800/60", 
        valueTag: "0" 
    },
    1: { 
        label: "Healed a while ago", 
        badgeClass: "bg-teal-950/50 text-teal-300 border-teal-800/60", 
        valueTag: "1" 
    },
    2: { 
        label: "Healed just on time", 
        badgeClass: "bg-blue-950/50 text-blue-300 border-blue-800/60", 
        valueTag: "2" 
    },
    3: { 
        label: "Still sore!", 
        badgeClass: "bg-red-950/60 text-red-300 border-red-800/70", 
        valueTag: "3" 
    },
}

const WORKLOAD_MAP: Record<number, { label: string; badgeClass: string; valueTag: string }> = {
    0: { 
        label: "Not enough", 
        badgeClass: "bg-amber-950/50 text-amber-300 border-amber-800/60", 
        valueTag: "0" 
    },
    1: { 
        label: "Just right", 
        badgeClass: "bg-emerald-950/50 text-emerald-300 border-emerald-800/60", 
        valueTag: "1" 
    },
    2: { 
        label: "Pushed limits", 
        badgeClass: "bg-orange-950/50 text-orange-300 border-orange-800/60", 
        valueTag: "2" 
    },
    3: { 
        label: "Too much", 
        badgeClass: "bg-red-950/60 text-red-300 border-red-800/70", 
        valueTag: "3" 
    },
}

const PUMP_MAP: Record<number, { label: string; badgeClass: string; valueTag: string }> = {
    0: { 
        label: "Low pump", 
        badgeClass: "bg-[#1f1f1f] text-[#8a8a8a] border-[#333333]", 
        valueTag: "0" 
    },
    1: { 
        label: "Moderate pump", 
        badgeClass: "bg-sky-950/50 text-sky-300 border-sky-800/60", 
        valueTag: "1" 
    },
    2: { 
        label: "Amazing pump", 
        badgeClass: "bg-purple-950/50 text-purple-300 border-purple-800/60", 
        valueTag: "2" 
    },
}

export default function FeedbackTable() {
    const params = useParams()
    // Defaults to mesocycle id 12 as requested
    const mesocycleId = params.mesocycleId || "12"

    const [selectedWeek, setSelectedWeek] = useState<string>("1")
    const [searchMuscle, setSearchMuscle] = useState<string>("")
    const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped")

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

    // Fetch all feedback data for this mesocycle
    const { data, isLoading, isError, error, refetch, isFetching } = useQuery<FeedbackApiResponse>({
        queryKey: ["mesocycle-feedback", mesocycleId],
        queryFn: async () => {
            const res = await fetch(`${apiUrl}/mesocycles/${mesocycleId}/feedback`)
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}))
                throw new Error(errBody.message || `Failed to fetch feedback (status ${res.status})`)
            }
            return res.json()
        }
    })

    const feedbacks = data?.feedbacks || []
    const availableWeeks = data?.availableWeeks || [1, 2, 3, 4]

    // Filter feedbacks by selected week and muscle search
    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter((item) => {
            const matchesWeek = selectedWeek === "all" || item.weeknumber === Number(selectedWeek)
            const matchesMuscle = !searchMuscle || item.muscleName.toLowerCase().includes(searchMuscle.toLowerCase())
            return matchesWeek && matchesMuscle
        })
    }, [feedbacks, selectedWeek, searchMuscle])

    // Group feedbacks by muscle for the grouped view
    const groupedByMuscle = useMemo(() => {
        const groups: Record<string, { muscleName: string; muscleGroupId: number; entries: FeedbackItem[] }> = {}
        
        filteredFeedbacks.forEach((item) => {
            if (!groups[item.muscleName]) {
                groups[item.muscleName] = {
                    muscleName: item.muscleName,
                    muscleGroupId: item.muscleGroupId,
                    entries: []
                }
            }
            groups[item.muscleName].entries.push(item)
        })

        // Sort by muscle name
        return Object.values(groups).sort((a, b) => a.muscleName.localeCompare(b.muscleName))
    }, [filteredFeedbacks])

    return (
        <div className="min-h-screen bg-[#000000] text-[#ededed] px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header & Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#222222] pb-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/home"
                                className="inline-flex items-center gap-1.5 text-xs text-[#8a8a8a] hover:text-[#ededed] transition-colors"
                            >
                                <ArrowLeft size={14} /> Back
                            </Link>
                            <span className="text-[#333333]">/</span>
                            <span className="text-xs uppercase tracking-wider text-red-500 font-semibold">Mesocycle Feedback</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#ededed] flex items-center gap-3">
                            Feedback Table
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#261212] border border-[#7f1d1d] text-red-400">
                                Meso #{mesocycleId} {data?.mesocycle?.mesoname ? `(${data.mesocycle.mesoname})` : ""}
                            </span>
                        </h1>
                        <p className="text-sm text-[#8a8a8a]">
                            Post-workout feedback matrix tracking Muscle Soreness, Workload difficulty, and Pump quality.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-[#222222] bg-[#0a0a0a] text-[#8a8a8a] hover:text-[#ededed] hover:border-[#333333] transition-colors disabled:opacity-50"
                            title="Refresh data"
                        >
                            <RefreshCw size={14} className={isFetching ? "animate-spin text-red-500" : ""} />
                            Refresh
                        </button>
                        <Link
                            to={`/mesocycles/${mesocycleId}/week/${selectedWeek === "all" ? 1 : selectedWeek}/days/1`}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors shadow-sm"
                        >
                            Open Workout <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Filters & Control Bar */}
                <div className="bg-[#0f0f0f] border border-[#222222] rounded-xl p-4 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Week Filter */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-[#8a8a8a] flex items-center gap-1.5">
                                <Calendar size={13} className="text-red-500" />
                                Filter by Week
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedWeek("all")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                        selectedWeek === "all"
                                            ? "border-red-500 bg-red-600/20 text-red-400 font-semibold shadow-sm"
                                            : "border-[#222222] bg-[#141414] text-[#8a8a8a] hover:text-[#ededed] hover:border-[#333333]"
                                    }`}
                                >
                                    All Weeks
                                </button>
                                {availableWeeks.map((week) => {
                                    const weekCount = feedbacks.filter((f) => f.weeknumber === week).length
                                    return (
                                        <button
                                            key={week}
                                            type="button"
                                            onClick={() => setSelectedWeek(String(week))}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                                selectedWeek === String(week)
                                                    ? "border-red-500 bg-red-600/20 text-red-400 font-semibold shadow-sm"
                                                    : "border-[#222222] bg-[#141414] text-[#8a8a8a] hover:text-[#ededed] hover:border-[#333333]"
                                            }`}
                                        >
                                            Week {week}
                                            {weekCount > 0 && (
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                                    selectedWeek === String(week) ? "bg-red-500/30 text-red-200" : "bg-[#222222] text-[#8a8a8a]"
                                                }`}>
                                                    {weekCount}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Search & Layout toggle */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search Muscle */}
                            <div className="relative min-w-[180px] max-w-xs flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                <input
                                    type="text"
                                    value={searchMuscle}
                                    onChange={(e) => setSearchMuscle(e.target.value)}
                                    placeholder="Search muscle..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#222222] bg-[#141414] text-[#ededed] placeholder-[#5a5a5a] focus:outline-none focus:border-red-500"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center rounded-lg border border-[#222222] bg-[#141414] p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("grouped")}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                        viewMode === "grouped"
                                            ? "bg-[#261212] border border-[#7f1d1d] text-red-400"
                                            : "text-[#8a8a8a] hover:text-[#ededed]"
                                    }`}
                                    title="Group by muscle"
                                >
                                    <Layers size={13} />
                                    Grouped
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("flat")}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                        viewMode === "flat"
                                            ? "bg-[#261212] border border-[#7f1d1d] text-red-400"
                                            : "text-[#8a8a8a] hover:text-[#ededed]"
                                    }`}
                                    title="Per session entry"
                                >
                                    <SlidersHorizontal size={13} />
                                    By Session
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* State: Loading */}
                {isLoading && (
                    <div className="p-12 text-center border border-[#222222] rounded-xl bg-[#0f0f0f] space-y-3">
                        <RefreshCw size={24} className="animate-spin text-red-500 mx-auto" />
                        <p className="text-sm text-[#8a8a8a]">Loading feedback data for Mesocycle {mesocycleId}...</p>
                    </div>
                )}

                {/* State: Error */}
                {isError && (
                    <div className="p-8 text-center border border-red-900/50 bg-red-950/20 rounded-xl space-y-3">
                        <p className="text-sm font-semibold text-red-400">Error loading feedback</p>
                        <p className="text-xs text-[#8a8a8a]">{error instanceof Error ? error.message : "Unknown error"}</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* State: Empty data */}
                {!isLoading && !isError && filteredFeedbacks.length === 0 && (
                    <div className="p-12 text-center border border-[#222222] rounded-xl bg-[#0f0f0f] space-y-3">
                        <Info size={28} className="text-[#5a5a5a] mx-auto" />
                        <h3 className="text-base font-semibold text-[#ededed]">No Feedback Logged</h3>
                        <p className="text-sm text-[#8a8a8a] max-w-md mx-auto">
                            {selectedWeek !== "all" 
                                ? `No feedback entries recorded for Week ${selectedWeek}. Complete a workout session in Week ${selectedWeek} to log feedback.`
                                : "No feedback entries recorded yet for this mesocycle."}
                        </p>
                        {availableWeeks.length > 0 && selectedWeek !== "1" && (
                            <button
                                type="button"
                                onClick={() => setSelectedWeek("1")}
                                className="mt-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#222222] bg-[#141414] text-[#ededed] hover:border-red-500 transition-colors"
                            >
                                Switch to Week 1
                            </button>
                        )}
                    </div>
                )}

                {/* The Feedback Table */}
                {!isLoading && !isError && filteredFeedbacks.length > 0 && (
                    <div className="overflow-hidden border border-[#222222] rounded-xl bg-[#0f0f0f] shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#222222] bg-[#141414]/90 text-xs font-semibold text-[#8a8a8a] uppercase tracking-wider">
                                        <th scope="col" className="py-4 px-5 min-w-[200px]">
                                            <div className="flex items-center gap-2">
                                                <Activity size={14} className="text-red-500" />
                                                <span>Muscle</span>
                                            </div>
                                        </th>
                                        <th scope="col" className="py-4 px-5 min-w-[240px]">
                                            <div className="flex items-center gap-2">
                                                <Flame size={14} className="text-red-400" />
                                                <span>Soreness</span>
                                            </div>
                                        </th>
                                        <th scope="col" className="py-4 px-5 min-w-[240px]">
                                            <div className="flex items-center gap-2">
                                                <Dumbbell size={14} className="text-amber-400" />
                                                <span>Workload</span>
                                            </div>
                                        </th>
                                        <th scope="col" className="py-4 px-5 min-w-[240px]">
                                            <div className="flex items-center gap-2">
                                                <HeartPulse size={14} className="text-sky-400" />
                                                <span>Pump</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#1f1f1f] text-sm">
                                    {viewMode === "grouped" ? (
                                        // Grouped View (One row per Muscle)
                                        groupedByMuscle.map((group) => (
                                            <tr 
                                                key={group.muscleName} 
                                                className="hover:bg-[#141414]/60 transition-colors"
                                            >
                                                {/* Left column: Muscle Name */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="space-y-1.5">
                                                        <div className="font-semibold text-[#ededed] text-base">
                                                            {group.muscleName}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {group.entries.map((entry) => (
                                                                <span
                                                                    key={entry.id}
                                                                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#1a1a1a] text-[#8a8a8a] border border-[#262626]"
                                                                >
                                                                    W{entry.weeknumber} • {entry.dayLabel || `Day ${entry.daynumber}`}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Soreness column */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="space-y-2">
                                                        {group.entries.map((entry) => {
                                                            const meta = SORENESS_MAP[entry.soreness] || {
                                                                label: `Value: ${entry.soreness}`,
                                                                badgeClass: "bg-[#1f1f1f] text-[#ededed] border-[#333333]",
                                                                valueTag: String(entry.soreness)
                                                            }
                                                            return (
                                                                <div key={entry.id} className="flex flex-col gap-1">
                                                                    {group.entries.length > 1 && (
                                                                        <span className="text-[10px] text-[#5a5a5a] font-mono">
                                                                            {entry.dayLabel} (W{entry.weeknumber}D{entry.daynumber}):
                                                                        </span>
                                                                    )}
                                                                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${meta.badgeClass}`}>
                                                                        <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 text-[11px]">
                                                                            {meta.valueTag}
                                                                        </span>
                                                                        <span>{meta.label}</span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Workload column */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="space-y-2">
                                                        {group.entries.map((entry) => {
                                                            const meta = WORKLOAD_MAP[entry.workload] || {
                                                                label: `Value: ${entry.workload}`,
                                                                badgeClass: "bg-[#1f1f1f] text-[#ededed] border-[#333333]",
                                                                valueTag: String(entry.workload)
                                                            }
                                                            return (
                                                                <div key={entry.id} className="flex flex-col gap-1">
                                                                    {group.entries.length > 1 && (
                                                                        <span className="text-[10px] text-[#5a5a5a] font-mono">
                                                                            {entry.dayLabel} (W{entry.weeknumber}D{entry.daynumber}):
                                                                        </span>
                                                                    )}
                                                                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${meta.badgeClass}`}>
                                                                        <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 text-[11px]">
                                                                            {meta.valueTag}
                                                                        </span>
                                                                        <span>{meta.label}</span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Pump column */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="space-y-2">
                                                        {group.entries.map((entry) => {
                                                            const meta = PUMP_MAP[entry.pump] || {
                                                                label: `Value: ${entry.pump}`,
                                                                badgeClass: "bg-[#1f1f1f] text-[#ededed] border-[#333333]",
                                                                valueTag: String(entry.pump)
                                                            }
                                                            return (
                                                                <div key={entry.id} className="flex flex-col gap-1">
                                                                    {group.entries.length > 1 && (
                                                                        <span className="text-[10px] text-[#5a5a5a] font-mono">
                                                                            {entry.dayLabel} (W{entry.weeknumber}D{entry.daynumber}):
                                                                        </span>
                                                                    )}
                                                                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${meta.badgeClass}`}>
                                                                        <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 text-[11px]">
                                                                            {meta.valueTag}
                                                                        </span>
                                                                        <span>{meta.label}</span>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        // Flat / Per-Session View
                                        filteredFeedbacks.map((entry) => {
                                            const sorenessMeta = SORENESS_MAP[entry.soreness] || {
                                                label: `Value: ${entry.soreness}`,
                                                badgeClass: "bg-[#1f1f1f] text-[#ededed] border-[#333333]",
                                                valueTag: String(entry.soreness)
                                            }
                                            const workloadMeta = WORKLOAD_MAP[entry.workload] || {
                                                label: `Value: ${entry.workload}`,
                                                badgeClass: "bg-[#1f1f1f] text-[#ededed] border-[#333333]",
                                                valueTag: String(entry.workload)
                                            }
                                            const pumpMeta = PUMP_MAP[entry.pump] || {
                                                label: `Value: ${entry.pump}`,
                                                badgeClass: "bg-[#1f1f1f] text-[#ededed] border-[#333333]",
                                                valueTag: String(entry.pump)
                                            }

                                            return (
                                                <tr 
                                                    key={entry.id} 
                                                    className="hover:bg-[#141414]/60 transition-colors"
                                                >
                                                    {/* Muscle Name */}
                                                    <td className="py-4 px-5">
                                                        <div className="font-semibold text-[#ededed] text-base">
                                                            {entry.muscleName}
                                                        </div>
                                                        <div className="text-xs text-[#8a8a8a] mt-0.5">
                                                            Week {entry.weeknumber} • {entry.dayLabel || `Day ${entry.daynumber}`}
                                                        </div>
                                                    </td>

                                                    {/* Soreness */}
                                                    <td className="py-4 px-5">
                                                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${sorenessMeta.badgeClass}`}>
                                                            <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 text-[11px]">
                                                                {sorenessMeta.valueTag}
                                                            </span>
                                                            <span>{sorenessMeta.label}</span>
                                                        </div>
                                                    </td>

                                                    {/* Workload */}
                                                    <td className="py-4 px-5">
                                                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${workloadMeta.badgeClass}`}>
                                                            <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 text-[11px]">
                                                                {workloadMeta.valueTag}
                                                            </span>
                                                            <span>{workloadMeta.label}</span>
                                                        </div>
                                                    </td>

                                                    {/* Pump */}
                                                    <td className="py-4 px-5">
                                                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${pumpMeta.badgeClass}`}>
                                                            <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 text-[11px]">
                                                                {pumpMeta.valueTag}
                                                            </span>
                                                            <span>{pumpMeta.label}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer summary inside card */}
                        <div className="px-5 py-3 border-t border-[#222222] bg-[#141414]/50 flex flex-wrap items-center justify-between text-xs text-[#8a8a8a] gap-2">
                            <span>
                                Showing <strong className="text-[#ededed]">{filteredFeedbacks.length}</strong> feedback {filteredFeedbacks.length === 1 ? "entry" : "entries"}
                                {selectedWeek !== "all" ? ` for Week ${selectedWeek}` : " across all weeks"}
                            </span>
                            <span className="text-[11px] text-[#5a5a5a]">
                                Mesocycle ID: {mesocycleId}
                            </span>
                        </div>
                    </div>
                )}

                {/* Rating Scale Legend */}
                <div className="border border-[#222222] rounded-xl bg-[#0a0a0a] p-4 text-xs text-[#8a8a8a] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ededed]">
                        <Info size={14} className="text-red-500" />
                        Rating Scales Reference
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        <div className="space-y-1">
                            <span className="font-semibold text-red-400">Soreness</span>
                            <ul className="space-y-0.5 text-[11px]">
                                <li><code className="text-[#ededed]">-1</code>: First session (no prior soreness)</li>
                                <li><code className="text-[#ededed]">0</code>: Never got sore</li>
                                <li><code className="text-[#ededed]">1</code>: Healed a while ago</li>
                                <li><code className="text-[#ededed]">2</code>: Healed just on time</li>
                                <li><code className="text-[#ededed]">3</code>: Still sore</li>
                            </ul>
                        </div>
                        <div className="space-y-1">
                            <span className="font-semibold text-amber-400">Workload</span>
                            <ul className="space-y-0.5 text-[11px]">
                                <li><code className="text-[#ededed]">0</code>: Not enough volume</li>
                                <li><code className="text-[#ededed]">1</code>: Just right</li>
                                <li><code className="text-[#ededed]">2</code>: Pushed my limits</li>
                                <li><code className="text-[#ededed]">3</code>: Too much volume</li>
                            </ul>
                        </div>
                        <div className="space-y-1">
                            <span className="font-semibold text-sky-400">Pump</span>
                            <ul className="space-y-0.5 text-[11px]">
                                <li><code className="text-[#ededed]">0</code>: Low pump</li>
                                <li><code className="text-[#ededed]">1</code>: Moderate pump</li>
                                <li><code className="text-[#ededed]">2</code>: Amazing pump</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
