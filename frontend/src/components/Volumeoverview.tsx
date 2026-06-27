import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import VolumeGraph from "./VolumeGraph"
import { Get } from "../service/centralisedApi.js"

type Week = {
    id: number | string
    week_name: string
    mesocycleId?: number
    unlocked?: boolean
    startingVolumeCount?: number
}

type WeekSelection = {
    weekId: string
    weekNumber: number
    isFinalWeek: boolean
}

export default function VolumeOverview({
    weekName,
    id,
    onWeekChange,
}: {
    weekName: Week[] | null
    id: string
    onWeekChange?: (selection: WeekSelection) => void
}) {
    const navigate = useNavigate()
    const [weeknumber, setWeeknumber] = useState(1)
    const [weekvolume, setWeekvolume] = useState(null)
    const [weekid, setWeekid] = useState<string | null>(null)

    const sortedWeeks = useMemo(() => {
        if (!weekName || weekName.length === 0) return []

        return [...weekName].sort((a, b) => {
            const numA = parseInt(a.week_name.replace(/\D/g, ""), 10) || 0
            const numB = parseInt(b.week_name.replace(/\D/g, ""), 10) || 0
            return numA - numB
        })
    }, [weekName])

    async function getWeekvolume(wid: string) {
        const result = await Get(`/mesoCycle/volume/${wid}`)
        if (!result.ok) {
            throw new Error(`Failed to fetch week volume: ${result.status}`)
        }
        const jsonified = await result.json()
        setWeekvolume(jsonified.volume)
    }

    function selectWeek(week: Week, index: number) {
        const resolvedWeekId = String(week.id)
        const weekNum = index + 1
        const isFinal = weekNum === sortedWeeks.length

        setWeeknumber(weekNum)
        setWeekid(resolvedWeekId)
        getWeekvolume(resolvedWeekId)
        onWeekChange?.({
            weekId: resolvedWeekId,
            weekNumber: weekNum,
            isFinalWeek: isFinal,
        })
    }

    useEffect(() => {
        if (sortedWeeks.length === 0) return

        const highestUnlockedIndex = sortedWeeks.reduce((latest, week, index) => {
            return week.unlocked ? index : latest
        }, -1)

        const defaultIndex = highestUnlockedIndex >= 0 ? highestUnlockedIndex : 0
        selectWeek(sortedWeeks[defaultIndex], defaultIndex)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedWeeks.length])

    function handleWeekSelect(week: Week, index: number) {
        if (!week.unlocked) return
        selectWeek(week, index)
    }

    return (
        <div>
            {/* ── WEEK TABS ── */}
            <div style={{ marginBottom: "32px" }}>
                {weekName == null ? (
                    <p style={{ color: "#6b7280", fontSize: "13px" }}>Loading...</p>
                ) : weekName.length === 0 ? (
                    <p style={{ color: "#6b7280", fontSize: "13px" }}>No weeks found</p>
                ) : (
                    <div
                        style={{
                            display: "inline-flex",
                            gap: "4px",
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #2a2a2a",
                            borderRadius: "10px",
                            padding: "4px",
                        }}
                    >
                        {sortedWeeks.map((week, index) => {
                            const isActive = weeknumber === index + 1
                            const isLocked = !week.unlocked

                            return (
                                <div
                                    key={week.id}
                                    data-weekId={week.id}
                                    onClick={() => handleWeekSelect(week, index)}
                                    title={isLocked ? "Complete previous week to unlock" : undefined}
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "7px 16px",
                                        borderRadius: "7px",
                                        fontSize: "13px",
                                        fontWeight: isActive ? 500 : 400,
                                        cursor: isLocked ? "not-allowed" : "pointer",
                                        transition: "background 0.15s, color 0.15s",
                                        backgroundColor: isActive && !isLocked ? "#ffffff" : "transparent",
                                        color: isActive && !isLocked
                                            ? "#000000"
                                            : isLocked
                                                ? "#3f3f46"
                                                : "#a1a1aa",
                                        userSelect: "none",
                                    }}
                                >
                                    <span>{week.week_name}</span>
                                    {isLocked && (
                                        <svg
                                            width="11"
                                            height="11"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            style={{ color: "#3f3f46", flexShrink: 0 }}
                                        >
                                            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ── SECTION HEADER ── */}
            <div>
                <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: "16px" }}
                >
                    <p
                        style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#ffffff",
                        }}
                    >
                        Week {weeknumber} — Volume Overview
                    </p>
                    <button
                        data-weekId={weekid}
                        disabled={!weekid}
                        onClick={() => navigate(`/mesocycle/week/${weekid}/?mesoId=${id}`)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            color: !weekid ? "#3f3f46" : "#6b7280",
                            background: "none",
                            border: "none",
                            cursor: !weekid ? "not-allowed" : "pointer",
                            padding: 0,
                            transition: "color 0.15s",
                            fontFamily: "inherit",
                            textDecoration: "none",
                        }}
                        onMouseEnter={e => { if (weekid) e.currentTarget.style.color = "#a1a1aa" }}
                        onMouseLeave={e => { if (weekid) e.currentTarget.style.color = "#6b7280" }}
                    >
                        Go to Week {weeknumber}
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* thin divider */}
                <div style={{ height: "1px", backgroundColor: "#1e1e1e", marginBottom: "16px" }} />

                {/* Volume table */}
                <div
                    style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                >
                    <VolumeGraph weekvolume={weekvolume} />
                </div>
            </div>
        </div>
    )
}
