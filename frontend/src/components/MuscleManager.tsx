import { useState, useEffect } from "react"
import { Get, Post } from "../service/centralisedApi.js"

type MuscleStatus = {
    muscleId: number
    muscleName: string
    active: boolean
}

export default function MuscleManager({
    weekId,
    onClose,
}: {
    weekId: string
    onClose: () => void
}) {
    const [muscles, setMuscles] = useState<MuscleStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [togglingId, setTogglingId] = useState<number | null>(null)

    async function fetchStatus() {
        setLoading(true)
        const res = await Get(`/mesoCycle/muscle/status/${weekId}`)
        if (res.ok) {
            const data = await res.json()
            setMuscles(data.muscles)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStatus()
    }, [weekId])

    async function handleToggle(muscleId: number, currentlyActive: boolean) {
        setTogglingId(muscleId)
        const res = await Post("/mesoCycle/muscle/toggle", {
            weekId: Number(weekId),
            muscleId,
            active: !currentlyActive,
        })
        if (res.ok) {
            setMuscles((prev) =>
                prev.map((m) =>
                    m.muscleId === muscleId ? { ...m, active: !currentlyActive } : m
                )
            )
        }
        setTogglingId(null)
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 20,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "440px",
                    backgroundColor: "#141414",
                    border: "1px solid #2a2a2a",
                    borderRadius: "14px",
                    maxHeight: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 24px 16px",
                        borderBottom: "1px solid #1e1e1e",
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontSize: "11px",
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "#6b7280",
                                marginBottom: "4px",
                            }}
                        >
                            Mesocycle
                        </p>
                        <h2
                            style={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: "#ffffff",
                            }}
                        >
                            Manage Muscles
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#6b7280",
                            cursor: "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path
                                d="M5 5l8 8M13 5l-8 8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                <div style={{ overflowY: "auto", padding: "8px 0" }}>
                    {loading ? (
                        <div
                            style={{
                                padding: "40px 24px",
                                textAlign: "center",
                                color: "#6b7280",
                                fontSize: "13px",
                            }}
                        >
                            Loading…
                        </div>
                    ) : muscles.length === 0 ? (
                        <div
                            style={{
                                padding: "40px 24px",
                                textAlign: "center",
                                color: "#3f3f46",
                                fontSize: "13px",
                            }}
                        >
                            No muscles configured
                        </div>
                    ) : (
                        muscles.map((muscle) => {
                            const isToggling = togglingId === muscle.muscleId
                            return (
                                <div
                                    key={muscle.muscleId}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "12px 24px",
                                        transition: "background 0.12s",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor = "#1a1a1a")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor = "transparent")
                                    }
                                >
                                    <span
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 400,
                                            letterSpacing: "0.03em",
                                            textTransform: "capitalize",
                                            color: muscle.active ? "#ffffff" : "#3f3f46",
                                            transition: "color 0.15s",
                                        }}
                                    >
                                        {muscle.muscleName}
                                    </span>

                                    <button
                                        onClick={() =>
                                            handleToggle(muscle.muscleId, muscle.active)
                                        }
                                        disabled={isToggling}
                                        style={{
                                            position: "relative",
                                            width: "40px",
                                            height: "22px",
                                            borderRadius: "11px",
                                            border: "none",
                                            cursor: isToggling ? "wait" : "pointer",
                                            backgroundColor: muscle.active
                                                ? "#ffffff"
                                                : "#2a2a2a",
                                            transition:
                                                "background-color 0.2s",
                                            padding: 0,
                                            opacity: isToggling ? 0.5 : 1,
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "3px",
                                                left: muscle.active ? "21px" : "3px",
                                                width: "16px",
                                                height: "16px",
                                                borderRadius: "50%",
                                                backgroundColor: muscle.active
                                                    ? "#000000"
                                                    : "#6b7280",
                                                transition:
                                                    "left 0.2s, background-color 0.2s",
                                            }}
                                        />
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>

                <div
                    style={{
                        padding: "16px 24px",
                        borderTop: "1px solid #1e1e1e",
                    }}
                >
                    <p
                        style={{
                            fontSize: "11px",
                            color: "#3f3f46",
                            lineHeight: 1.5,
                        }}
                    >
                        Deactivated muscles won't count toward weekly volume
                        requirements or need feedback, and are hidden from session logs.
                    </p>
                </div>
            </div>
        </div>
    )
}
