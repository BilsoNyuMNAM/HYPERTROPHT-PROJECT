import { useNavigate } from "react-router-dom"

type mesocycle = {
    id: number
    name: string
    completed: number
    total_session: number
    _count: {
        week: number
    }
}

function Mesocycle({
    mesocycle,
    onDelete,
    isPending,
}: {
    mesocycle: mesocycle[] | any
    onDelete?: (mesocycleId: number) => void
    isPending?: boolean
}) {
    const navigate = useNavigate()

    function Redirect(e: any) {
        const mesoId = e.currentTarget.getAttribute("data-meso-id")
        navigate(`/mesocycle/display/${mesoId}`)
    }

    if (mesocycle.length === 0) {
        return (
            <div
                style={{
                    padding: "64px 0",
                    textAlign: "center",
                    color: "#3f3f46",
                    fontSize: "14px",
                }}
            >
                No mesocycles yet — create your first one to get started.
            </div>
        )
    }

    return (
        <>
            {mesocycle.map((item: mesocycle) => {
                const progressPct =
                    item._count.week > 0
                        ? Math.min((item.completed / item._count.week) * 100, 100)
                        : 0

                return (
                    <div
                        key={item.id}
                        className="group"
                        data-meso-id={item.id}
                        onClick={Redirect}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "24px 0",
                            borderTop: "1px solid #1e1e1e",
                            cursor: "pointer",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "transparent")}
                    >
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <span
                                style={{
                                    fontSize: "22px",
                                    fontWeight: 600,
                                    color: "#e8e8e8",
                                    letterSpacing: "-0.01em",
                                    transition: "color 0.15s",
                                    fontFamily: "inherit",
                                }}
                                className="group-hover:text-white"
                            >
                                {item.name}
                            </span>

                           
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div
                                    style={{
                                        width: "80px",
                                        height: "3px",
                                        backgroundColor: "#2a2a2a",
                                        borderRadius: "999px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${progressPct}%`,
                                            backgroundColor: "#ffffff",
                                            borderRadius: "999px",
                                            transition: "width 0.3s ease",
                                        }}
                                    />
                                </div>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        color: "#3f3f46",
                                        letterSpacing: "0.04em",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {item.completed} / {item._count.week}
                                </span>
                            </div>
                        </div>

                        
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "32px",
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                         
                            <div style={{ textAlign: "right" }}>
                                <div
                                    style={{
                                        fontSize: "32px",
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        color: "#2a2a2a",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    {item.total_session}
                                </div>
                                <div
                                    style={{
                                        fontSize: "9px",
                                        letterSpacing: "0.2em",
                                        textTransform: "uppercase",
                                        color: "#3f3f46",
                                        marginTop: "4px",
                                    }}
                                >
                                    Sessions
                                </div>
                            </div>

                           
                            <div style={{ textAlign: "right" }}>
                                <div
                                    style={{
                                        fontSize: "32px",
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        color: "#ffffff",
                                        letterSpacing: "-0.02em",
                                    }}
                                >
                                    {item._count.week}
                                </div>
                                <div
                                    style={{
                                        fontSize: "9px",
                                        letterSpacing: "0.2em",
                                        textTransform: "uppercase",
                                        color: "#3f3f46",
                                        marginTop: "4px",
                                    }}
                                >
                                    Weeks
                                </div>
                            </div>

                           
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete?.(item.id)
                                }}
                                disabled={isPending}
                                style={{
                                    border: "1px solid #2a2a2a",
                                    borderRadius: "6px",
                                    padding: "5px 12px",
                                    fontSize: "10px",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "#6b7280",
                                    background: "none",
                                    cursor: isPending ? "not-allowed" : "pointer",
                                    opacity: isPending ? 0.45 : 1,
                                    fontFamily: "inherit",
                                    transition: "color 0.15s, border-color 0.15s",
                                }}
                                onMouseEnter={e => {
                                    if (!isPending) {
                                        e.currentTarget.style.color = "#f87171"
                                        e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"
                                    }
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = "#6b7280"
                                    e.currentTarget.style.borderColor = "#2a2a2a"
                                }}
                            >
                                {isPending ? "Deleting..." : "Delete"}
                            </button>

                         
                            <div
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/mesocycle/display/${item.id}`)
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    border: "1px solid #2a2a2a",
                                    color: "#3f3f46",
                                    cursor: "pointer",
                                    transition: "color 0.15s, border-color 0.15s",
                                    flexShrink: 0,
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = "#ffffff"
                                    e.currentTarget.style.borderColor = "#3f3f46"
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = "#3f3f46"
                                    e.currentTarget.style.borderColor = "#2a2a2a"
                                }}
                            >
                                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default Mesocycle;
