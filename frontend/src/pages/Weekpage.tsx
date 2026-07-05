import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useState } from "react"
import Sessioncard from "../components/Sessioncard"
import { useQuery } from "@tanstack/react-query"
import { Get, Post, Delete } from "../service/centralisedApi.js"
import { Spinner } from "../components/ui/spinner"
import DeleteDialog from "./DeleteDialog"

type SessionListItem = {
    id: number
    session_name: string
}

function Createsessionpage({
    weekId,
    setDisplaySession,
    refetch,
}: {
    weekId: string
    setDisplaySession: any
    refetch: any
}) {
    const [searchParams] = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const mesoId = searchParams.get("mesoId")
    const [sessionName, setSessionName] = useState("")

    function handlechange(e: any) {
        const { value } = e.target
        setSessionName(value)
    }

    async function Submit() {
        setIsLoading(true)
        try {
            const res = await Post(`/mesoCycle/session/create/${weekId}?sessionId=${mesoId}`, {
                session_name: sessionName,
            })
            if (res.status === 201) {
                setDisplaySession(false)
                refetch()
            }
        } catch (error) {
            console.error("Error creating session:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 10,
                backgroundColor: "#0f0f0f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
            }}
        >
            <div style={{ width: "100%", maxWidth: "420px", padding: "0 24px" }}>
                {/* Close / back */}
                <button
                    onClick={() => setDisplaySession(false)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        letterSpacing: "0.05em",
                        color: "#6b7280",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        marginBottom: "40px",
                        fontFamily: "inherit",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#a1a1aa")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Cancel
                </button>

                {/* Heading */}
                <p
                    style={{
                        fontSize: "11px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#6b7280",
                        marginBottom: "8px",
                    }}
                >
                    New Session
                </p>
                <h1
                    style={{
                        fontSize: "2.2rem",
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        marginBottom: "8px",
                    }}
                >
                    Create Session
                </h1>
                <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "32px" }}>
                    Name your session to get started
                </p>

                {/* Input */}
                <div style={{ marginBottom: "16px" }}>
                    <input
                        type="text"
                        onChange={handlechange}
                        name="session"
                        value={sessionName}
                        placeholder="Session name"
                        style={{
                            width: "100%",
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #2a2a2a",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            fontSize: "14px",
                            color: "#ffffff",
                            outline: "none",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                            transition: "border-color 0.15s",
                        }}
                        onFocus={e => (e.currentTarget.style.borderColor = "#3f3f46")}
                        onBlur={e => (e.currentTarget.style.borderColor = "#2a2a2a")}
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={Submit}
                    disabled={isLoading || sessionName.trim() === ""}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        backgroundColor: isLoading || sessionName.trim() === "" ? "#2a2a2a" : "#ffffff",
                        color: isLoading || sessionName.trim() === "" ? "#6b7280" : "#000000",
                        border: "none",
                        borderRadius: "8px",
                        padding: "13px",
                        fontSize: "13px",
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        cursor: isLoading || sessionName.trim() === "" ? "not-allowed" : "pointer",
                        opacity: isLoading || sessionName.trim() === "" ? 0.5 : 1,
                        transition: "opacity 0.15s",
                        fontFamily: "inherit",
                    }}
                >
                    {isLoading ? (
                        <>
                            <div
                                style={{
                                    width: "14px",
                                    height: "14px",
                                    border: "2px solid #6b7280",
                                    borderTopColor: "transparent",
                                    borderRadius: "50%",
                                    animation: "spin 0.7s linear infinite",
                                }}
                            />
                            Creating...
                        </>
                    ) : (
                        "Create Session"
                    )}
                </button>
            </div>
        </div>
    )
}


// ── WEEK PAGE ───────────────────────────────────────────────────────────────
export default function Weekpage() {
     const [searchParam] = useSearchParams()
     const weeknumber = searchParam.get("weeknumber");
    const navigate = useNavigate()
    const { weekId } = useParams()
    const [displaySession, setDisplaySession] = useState(false)
    const [weekStatus, setWeekStatus] = useState<{
        unlocked: boolean
        nextWeekUnlocked: boolean
        isFinalWeek: boolean
    } | null>(null)
    const [loadError, setLoadError] = useState("")
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleteSessionInfo, setDeleteSessionInfo] = useState<{ id: number; name: string } | null>(null)

    const [searchParams] = useSearchParams()
    const mesoId = searchParams.get("mesoId") || ""

    const { data, refetch, isLoading } = useQuery({
        queryKey: ["sessions", weekId],
        queryFn: async function () {
            const response = await Get(`/mesoCycle/session/all/${weekId}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch sessions: ${response.status}`)
            }
            return await response.json()
        },
    })

    function handleDeleteClick(sessionId: number, sessionName: string) {
        setDeleteSessionInfo({ id: sessionId, name: sessionName })
        setShowDeleteDialog(true)
    }

    async function performDeleteSession(sessionId: number) {
        try {
            const response = await Delete(`/mesoCycle/session/${sessionId}`)
            const data = await response.json()
            if (!response.ok) {
                setLoadError(data.message || "Unable to delete session")
                return
            }
        } catch (error) {
            console.error("Error deleting session:", error)
            setLoadError("An error occurred while deleting the session")
            return
        } finally {
            refetch()
        }
    }

    const sessions: SessionListItem[] = data?.result.sessions ?? []

    // Week status pill label
    const weekStatusLabel = weekStatus?.isFinalWeek
        ? "Final Week"
        : weekStatus?.nextWeekUnlocked
            ? "Next Week Unlocked"
            : "Next Week Locked"

    const weekStatusColor = weekStatus?.isFinalWeek
        ? { dot: "#22c55e", text: "#22c55e" }
        : weekStatus?.nextWeekUnlocked
            ? { dot: "#22c55e", text: "#22c55e" }
            : { dot: "#6b7280", text: "#6b7280" }

    return (
        <div
            className="h-screen w-full overflow-y-auto"
            style={{
                backgroundColor: "#0f0f0f",
                color: "#ffffff",
                fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
            }}
        >
            {/* Create session overlay */}
            {displaySession ? (
                <Createsessionpage
                    weekId={weekId || ""}
                    setDisplaySession={setDisplaySession}
                    refetch={refetch}
                />
            ) : null}

            {showDeleteDialog && deleteSessionInfo && (
                <DeleteDialog
                    onConfirm={() => {
                        performDeleteSession(deleteSessionInfo.id)
                        setShowDeleteDialog(false)
                        setDeleteSessionInfo(null)
                    }}
                    onCancel={() => {
                        setShowDeleteDialog(false)
                        setDeleteSessionInfo(null)
                    }}
                />
            )}

            <div className="w-full max-w-4xl mx-auto">

                {/* ── NAV ── */}
                <nav
                    className="flex items-center px-10 py-6"
                    style={{ borderBottom: "1px solid #1e1e1e" }}
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 transition-colors"
                        style={{
                            fontSize: "12px",
                            letterSpacing: "0.05em",
                            color: "#6b7280",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            fontFamily: "inherit",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#a1a1aa")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to Week
                    </button>
                </nav>

                {/* ── HEADER ── */}
                <div className="px-10 pt-10 pb-8">
                    <p
                        style={{
                            fontSize: "11px",
                            letterSpacing: "0.12em",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            marginBottom: "8px",
                        }}
                    >
                        Week
                    </p>
                    <div className="flex items-start justify-between gap-4">
                        <h1
                            style={{
                                fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                                fontWeight: 700,
                                lineHeight: 1.1,
                                color: "#ffffff",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Session Plan
                        </h1>

                        {/* Week status badge */}
                        {weekStatus !== null && (
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    backgroundColor: "#1a1a1a",
                                    border: "1px solid #2a2a2a",
                                    borderRadius: "999px",
                                    padding: "6px 14px",
                                    fontSize: "11px",
                                    letterSpacing: "0.06em",
                                    color: weekStatusColor.text,
                                    marginTop: "10px",
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        backgroundColor: weekStatusColor.dot,
                                        flexShrink: 0,
                                    }}
                                />
                                {weekStatusLabel}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── DIVIDER ── */}
                <div style={{ height: "1px", backgroundColor: "#1e1e1e", margin: "0 40px" }} />

                {/* ── BODY ── */}
                <div className="px-10 py-8" style={{ paddingBottom: "80px" }}>

                    {/* Error message */}
                    {loadError ? (
                        <div
                            style={{
                                marginBottom: "20px",
                                borderRadius: "8px",
                                border: "1px solid rgba(239,68,68,0.3)",
                                backgroundColor: "rgba(239,68,68,0.08)",
                                padding: "12px 16px",
                                fontSize: "12px",
                                color: "#fca5a5",
                            }}
                        >
                            {loadError}
                        </div>
                    ) : null}

                    {/* Session list / spinner */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Spinner className="w-7 h-7 text-white" />
                        </div>
                    ) : (
                        <div>
                            {/* Section sub-header */}
                            <div
                                className="flex items-center justify-between"
                                style={{ marginBottom: "16px" }}
                            >
                                <p
                                    style={{
                                        fontSize: "11px",
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        color: "#6b7280",
                                        fontWeight: 500,
                                    }}
                                >
                                    Sessions
                                </p>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        color: "#3f3f46",
                                    }}
                                >
                                    {sessions.length} total
                                </span>
                            </div>

                            {/* Thin divider */}
                            <div style={{ height: "1px", backgroundColor: "#1e1e1e", marginBottom: "16px" }} />

                            
                            {sessions.length === 0 ? (
                                <div
                                    style={{
                                        padding: "40px 24px",
                                        textAlign: "center",
                                        color: "#3f3f46",
                                        fontSize: "14px",
                                    }}
                                >
                                    No sessions yet — create your first one below
                                </div>
                            ) : (
                                sessions.map((session, index) => (
                                    <Sessioncard
                                        key={session.id}
                                        id={session.id}
                                        sessionName={session.session_name}
                                        number={index + 1}
                                        weekId={weekId || ""}
                                        mesoId={mesoId}
                                        onDeleteSession={handleDeleteClick}
                                        isLoading={isLoading}
                                        weeknumber={weeknumber || ""}
                                    />
                                ))
                            )}

                            {/* Add session button */}
                            <button
                                onClick={() => setDisplaySession(true)}
                                style={{
                                    marginTop: "16px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    backgroundColor: "#1a1a1a",
                                    color: "#a1a1aa",
                                    border: "1px solid #2a2a2a",
                                    borderRadius: "8px",
                                    padding: "10px 18px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    letterSpacing: "0.05em",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "color 0.15s, border-color 0.15s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = "#ffffff"
                                    e.currentTarget.style.borderColor = "#3f3f46"
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = "#a1a1aa"
                                    e.currentTarget.style.borderColor = "#2a2a2a"
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Add Session
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
