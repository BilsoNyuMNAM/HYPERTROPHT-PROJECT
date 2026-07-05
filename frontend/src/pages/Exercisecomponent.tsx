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

    function applyMuscleSelection(muscleName: string) {
        fetchSorenessIfNeeded(muscleName)
        setSelected(muscleName)
        Selecttrainedmuscle(id, muscleName)
    }

    function handleMuscleSelect(clickedMuscleName: string) {
        if (selected === clickedMuscleName) {
            setSelected("")
            Selecttrainedmuscle(id, "")
            return
        }
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

    const isOverTarget = muscletrained !== "" && setsLeft !== null && setsLeft < 0

    return (
        <div style={{ marginBottom: "12px" }}>
            <div
                style={{
                    border: "1px solid #2a2a2a",
                    borderRadius: "12px",
                    backgroundColor: "#1a1a1a",
                }}
            >
                <div style={{ padding: "20px" }}>

                    {/* Exercise name + delete */}
                    <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
                        <input
                            placeholder="Exercise name"
                            onChange={(e) => exerciseName(e, id)}
                            value={exercise_name}
                            name="exercise_name"
                            style={{
                                flex: 1,
                                background: "none",
                                border: "none",
                                outline: "none",
                                fontSize: "14px",
                                fontWeight: 600,
                                letterSpacing: "0.02em",
                                color: "#ffffff",
                                fontFamily: "inherit",
                            }}
                        />
                        <button
                            onClick={() => deleteExercise(id)}
                            style={{
                                flexShrink: 0,
                                border: "1px solid #2a2a2a",
                                borderRadius: "6px",
                                padding: "5px 10px",
                                fontSize: "10px",
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: "#6b7280",
                                background: "none",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "color 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = "#f87171"
                                e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = "#6b7280"
                                e.currentTarget.style.borderColor = "#2a2a2a"
                            }}
                        >
                            Delete
                        </button>
                    </div>

                    {/* Muscle selector */}
                    <div
                        style={{
                            position: "relative",
                            fontSize: "11px",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#6b7280",
                            userSelect: "none",
                            paddingBottom: "14px",
                        }}
                    >
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                onClick={() => { setOpen(!isOpen); setCurrentDropdown(id) }}
                                style={{ cursor: "pointer" }}
                            >
                                Muscle trained
                            </span>

                            {selected !== "" && (
                                <button
                                    style={{
                                        fontSize: "10px",
                                        letterSpacing: "0.06em",
                                        border: `1px solid ${MUSCLE_COLORS[selected] || "#3f3f46"}`,
                                        borderRadius: "6px",
                                        padding: "3px 10px",
                                        color: MUSCLE_COLORS[selected] || "#a1a1aa",
                                        background: "none",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {selected}
                                </button>
                            )}
                        </div>

                        {/* Soreness logged */}
                        {sorenessLog && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    padding: "10px 14px",
                                    border: "1px solid rgba(249,115,22,0.3)",
                                    borderRadius: "8px",
                                    backgroundColor: "rgba(249,115,22,0.06)",
                                    fontSize: "11px",
                                    color: "#fb923c",
                                }}
                            >
                                <span style={{ fontWeight: 600 }}>Soreness logged:</span>{" "}
                                Score {sorenessLog.level} — {sorenessLog.label}
                            </div>
                        )}

                        {/* Over-target warning */}
                        {isOverTarget && (
                            <p
                                style={{
                                    marginTop: "6px",
                                    fontSize: "11px",
                                    color: "#fb923c",
                                    letterSpacing: "0.06em",
                                }}
                            >
                                {Math.abs(setsLeft!)} {Math.abs(setsLeft!) === 1 ? "set" : "sets"} over weekly target
                            </p>
                        )}

                        {/* Muscle dropdown */}
                        {isOpen && id === currentDropdown && (
                            <div
                                style={{
                                    position: "absolute",
                                    zIndex: 10,
                                    top: "100%",
                                    left: 0,
                                    width: "100%",
                                    boxSizing: "border-box",
                                    backgroundColor: "#111111",
                                    border: "1px solid #2a2a2a",
                                    borderRadius: "10px",
                                    padding: "12px",
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                    minWidth: "260px",
                                    marginTop: "4px",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                                }}
                            >
                                {pendingMuscleSelection ? (
                                    /* Over-limit confirmation */
                                    <div
                                        style={{
                                            flexBasis: "100%",
                                            padding: "12px",
                                            border: "1px solid rgba(249,115,22,0.3)",
                                            borderRadius: "8px",
                                            backgroundColor: "rgba(249,115,22,0.08)",
                                        }}
                                    >
                                        <p
                                            style={{
                                                color: "#fb923c",
                                                fontSize: "11px",
                                                marginBottom: "10px",
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            <span style={{ fontWeight: 700, textTransform: "uppercase" }}>
                                                {pendingMuscleSelection.muscleName}
                                            </span>{" "}
                                            is{" "}
                                            <span style={{ fontWeight: 700 }}>{pendingMuscleSelection.setsOver}</span>{" "}
                                            {pendingMuscleSelection.setsOver === 1 ? "set" : "sets"} over the weekly target. Continue anyway?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={confirmPendingMuscleSelection}
                                                style={{
                                                    fontSize: "10px",
                                                    border: "1px solid rgba(249,115,22,0.5)",
                                                    borderRadius: "6px",
                                                    padding: "6px 12px",
                                                    color: "#fb923c",
                                                    background: "none",
                                                    cursor: "pointer",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                Keep sets & continue
                                            </button>
                                            <button
                                                onClick={cancelPendingMuscleSelection}
                                                style={{
                                                    fontSize: "10px",
                                                    border: "1px solid #2a2a2a",
                                                    borderRadius: "6px",
                                                    padding: "6px 12px",
                                                    color: "#6b7280",
                                                    background: "none",
                                                    cursor: "pointer",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {muscle.map(musclename => (
                                            <button
                                                key={musclename}
                                                onClick={() => handleMuscleSelect(musclename)}
                                                style={{
                                                    fontSize: "10px",
                                                    letterSpacing: "0.06em",
                                                    textTransform: "uppercase",
                                                    border: `1px solid ${selected === musclename ? MUSCLE_COLORS[musclename] || "#ffffff" : "#2a2a2a"}`,
                                                    borderRadius: "6px",
                                                    padding: "6px 10px",
                                                    color: selected === musclename
                                                        ? MUSCLE_COLORS[musclename] || "#ffffff"
                                                        : "#6b7280",
                                                    background: selected === musclename
                                                        ? `${MUSCLE_COLORS[musclename]}18` || "rgba(255,255,255,0.05)"
                                                        : "none",
                                                    cursor: "pointer",
                                                    fontFamily: "inherit",
                                                    transition: "all 0.15s",
                                                }}
                                            >
                                                {musclename}
                                            </button>
                                        ))}
                                        <div style={{ flexBasis: "100%" }}>
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
                    <div
                        style={{
                            border: "1px solid #2a2a2a",
                            borderRadius: "10px",
                            backgroundColor: "#111111",
                            overflow: "hidden",
                        }}
                    >
                        {set.length === 0 ? (
                            <div
                                style={{
                                    padding: "24px",
                                    textAlign: "center",
                                    color: "#3f3f46",
                                    fontSize: "13px",
                                }}
                            >
                                Add your first set
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
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px",
                                padding: "12px",
                                borderTop: set.length > 0 ? "1px solid #1e1e1e" : "none",
                            }}
                        >
                            <button
                                onClick={() => addset(id)}
                                style={{
                                    fontSize: "11px",
                                    letterSpacing: "0.06em",
                                    color: "#6b7280",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "color 0.15s",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#a1a1aa")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                            >
                                + Add Set
                            </button>
                            {muscletrained === "" && (
                                <p style={{ fontSize: "10px", color: "#3f3f46" }}>
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
