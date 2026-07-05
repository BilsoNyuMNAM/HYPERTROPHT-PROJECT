import { useNavigate } from "react-router-dom"

export default function Sessioncard({
    id,
    sessionName,
    number,
    weekId,
    mesoId,
    onDeleteSession,
    isLoading,
    weeknumber
}: {
    id: number
    sessionName: string
    number: number
    weekId: string
    mesoId: string
    onDeleteSession: (sessionId: number, sessionName: string) => void | Promise<void>
    isLoading: boolean
    weeknumber: string
}) {
    const navigate = useNavigate()
    const sessionId = id

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "14px 18px",
                marginBottom: "8px",
                borderRadius: "10px",
                border: "1px solid #2a2a2a",
                backgroundColor: "#1a1a1a",
                transition: "border-color 0.15s, background 0.15s",
                cursor: "default",
            }}
            data-sessionid={id}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#3f3f46"
                e.currentTarget.style.backgroundColor = "#1f1f1f"
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#2a2a2a"
                e.currentTarget.style.backgroundColor = "#1a1a1a"
            }}
        >
            {/* Left: number badge + name */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                <div
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "#111111",
                        border: "1px solid #2a2a2a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#a1a1aa",
                        flexShrink: 0,
                    }}
                >
                    {number}
                </div>
                <div style={{ minWidth: 0 }}>
                    <p
                        style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#ffffff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {sessionName}
                    </p>
                    <p
                        style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            marginTop: "2px",
                        }}
                    >
                        Session {number}
                    </p>
                </div>
            </div>

            
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <button
                    disabled={isLoading}
                    onClick={(event) => {
                        event.stopPropagation()
                        onDeleteSession(sessionId, sessionName)
                    }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        border: "1px solid #2a2a2a",
                        borderRadius: "6px",
                        padding: "5px 12px",
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#6b7280",
                        background: "none",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.45 : 1,
                        fontFamily: "inherit",
                        transition: "color 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={e => {
                        if (!isLoading) {
                            e.currentTarget.style.color = "#f87171"
                            e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"
                        }
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = "#6b7280"
                        e.currentTarget.style.borderColor = "#2a2a2a"
                    }}
                >
                    {isLoading ? "Deleting..." : "Delete"}
                </button>

                <button
                    onClick={() =>
                        navigate(`/mesocycle/week/session/${sessionId}/?weeknumber=${weeknumber}`, {
                            state: { weekId, mesoId },
                        })
                    }
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "#111111",
                        border: "1px solid #2a2a2a",
                        color: "#6b7280",
                        cursor: "pointer",
                        transition: "color 0.15s, border-color 0.15s",
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = "#ffffff"
                        e.currentTarget.style.borderColor = "#3f3f46"
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = "#6b7280"
                        e.currentTarget.style.borderColor = "#2a2a2a"
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
