import { useNavigate, useParams } from "react-router-dom"

import {useState, useRef} from "react"
import { useQuery } from "@tanstack/react-query"
import VolumeOverview from "../components/Volumeoverview"
import MuscleManager from "../components/MuscleManager"
import { Get, Post } from "../service/centralisedApi.js"
import { Spinner } from "../components/ui/spinner"

export default function Mesocycleui() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data, isLoading } = useQuery({
        queryKey: ['mesoCycledata', id],
        queryFn: async function () {
            const result = await Get(`/mesoCycle/${id}`)
            if (!result.ok) {
                throw new Error(`Failed to fetch mesocycle: ${result.status}`)
            }
            return await result.json();
        }
    })

    const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null)
    const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null)
    const [selectedWeekIsFinal, setSelectedWeekIsFinal] = useState(false)
    const [isCalculating, setIsCalculating] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const [calculateMessage, setCalculateMessage] = useState("")
    const [calculateErrors, setCalculateErrors] = useState<string[]>([])
    const [showMuscleManager, setShowMuscleManager] = useState(false)
    const loading = useRef(false)

    async function handleCalculateNextWeek() {
        if(loading.current) return
        loading.current = true
        if (!selectedWeekId || selectedWeekIsFinal) return

        setIsCalculating(true)
        setCalculateMessage("")
        setCalculateErrors([])

        try {
            
            const response = await Post(
                `/mesoCycle/week/calculate-next/${selectedWeekId}`
            )
            const data = await response.json()

            if (!response.ok) {
                const errors = Array.isArray(data.errors)
                    ? data.errors.map((error: { message?: string }) => error.message || "Incomplete data found")
                    : []

                setCalculateErrors(errors)
                setCalculateMessage(data.message || "Unable to calculate next week volume.")
                return
            }

            setCalculateMessage("Next week volume calculated and unlocked successfully.")

        } catch (error) {
            setCalculateMessage("Failed to calculate next week volume.")
        } finally {
            setIsCalculating(false)
            loading.current = false
           
        }
    }

    async function handleResetFromSelectedWeek() {
        if (!selectedWeekId || isResetting || selectedWeekNumber === 1) return 
        
        setIsResetting(true)
        setCalculateMessage("")
        setCalculateErrors([])

        try {
            const response = await Post(
                `/mesoCycle/week/reset-from/${selectedWeekId}`
            )
            const data = await response.json()

            if (!response.ok) {
                setCalculateMessage(data.message || "Unable to reset from selected week.")
                return
            }

            setCalculateMessage("Reset complete. Selected week and following weeks are now locked.")

        } catch (error) {
            setCalculateMessage("Failed to reset from selected week.")
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <>
            {
                isLoading ? (
                    <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0f0f0f" }}>
                        <Spinner className="w-8 h-8 text-white" />
                    </div>
                ) : (
                    <div
                        className="w-full min-h-screen overflow-y-auto"
                        style={{
                            backgroundColor: "#0f0f0f",
                            color: "#ffffff",
                            fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
                        }}
                    >
                        <div className="w-full max-w-4xl mx-auto">
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
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "#a1a1aa")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Mesocycles
                                </button>
                            </nav>
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
                                    Mesocycle
                                </p>
                                <h1
                                    style={{
                                        fontSize: "clamp(2.4rem, 6vw, 3.5rem)",
                                        fontWeight: 700,
                                        lineHeight: 1.1,
                                        color: "#ffffff",
                                        letterSpacing: "-0.02em",
                                        marginBottom: "32px",
                                    }}
                                >
                                    {data?.result.name.name || "Mesocycle Name"}
                                </h1>

                               
                                <div className="flex gap-4">
                                   
                                    <div
                                        style={{
                                            backgroundColor: "#1a1a1a",
                                            border: "1px solid #2a2a2a",
                                            borderRadius: "12px",
                                            padding: "20px 24px",
                                            minWidth: "140px",
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                                color: "#6b7280",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            Sessions
                                        </p>
                                        <div
                                            style={{
                                                fontSize: "2.5rem",
                                                fontWeight: 700,
                                                color: "#ffffff",
                                                lineHeight: 1,
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {data?.result.totalsession || 0}
                                        </div>
                                        <div
                                            className="flex items-center gap-1"
                                            style={{ fontSize: "11px", color: "#6b7280" }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: "6px",
                                                    height: "6px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "#6b7280",
                                                    marginRight: "4px",
                                                }}
                                            />
                                            
                                        </div>
                                    </div>

                                    
                                    <div
                                        style={{
                                            backgroundColor: "#1a1a1a",
                                            border: "1px solid #2a2a2a",
                                            borderRadius: "12px",
                                            padding: "20px 24px",
                                            minWidth: "140px",
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                                color: "#6b7280",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            Weeks
                                        </p>
                                        <div
                                            style={{
                                                fontSize: "2.5rem",
                                                fontWeight: 700,
                                                color: "#ffffff",
                                                lineHeight: 1,
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {data?.result.weekname?.length == 0 ? "0" : data?.result.weekname?.length}
                                        </div>
                                        <div
                                            className="flex items-center gap-1"
                                            style={{ fontSize: "11px", color: "#6b7280" }}
                                        >
                                            Total Planned
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: "1px", backgroundColor: "#1e1e1e", margin: "0 40px" }} />
                            <div className="px-10 py-8" style={{ paddingBottom: "64px" }}>
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <button
                                        type="button"
                                        onClick={handleCalculateNextWeek}
                                        disabled={selectedWeekIsFinal || isCalculating || !selectedWeekId || loading.current}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: selectedWeekIsFinal || isCalculating || !selectedWeekId || loading.current ? "#2a2a2a" : "#ffffff",
                                            color: selectedWeekIsFinal || isCalculating || !selectedWeekId || loading.current ? "#6b7280" : "#000000",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "10px 18px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            letterSpacing: "0.04em",
                                            cursor: selectedWeekIsFinal || isCalculating || !selectedWeekId || loading.current ? "not-allowed" : "pointer",
                                            transition: "opacity 0.15s",
                                            opacity: selectedWeekIsFinal || isCalculating || !selectedWeekId || loading.current ? 0.45 : 1,
                                            height: "40px",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {selectedWeekIsFinal
                                            ? "Mesocycle Complete"
                                            : isCalculating
                                                ? "Calculating..."
                                                : "Calculate Volume for Next Week"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResetFromSelectedWeek}
                                        disabled={isResetting || !selectedWeekId || selectedWeekNumber === 1}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#1a1a1a",
                                            color: isResetting || !selectedWeekId || selectedWeekNumber === 1 ? "#6b7280" : "#ffffff",
                                            border: "1px solid #2a2a2a",
                                            borderRadius: "8px",
                                            padding: "10px 18px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            letterSpacing: "0.04em",
                                            cursor: isResetting || !selectedWeekId || selectedWeekNumber === 1 ? "not-allowed" : "pointer",
                                            transition: "opacity 0.15s",
                                            opacity: isResetting || !selectedWeekId || selectedWeekNumber === 1 ? 0.45 : 1,
                                            height: "40px",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {isResetting ? "Resetting..." : "Reset from Selected Week"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowMuscleManager(true)}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#1a1a1a",
                                            color: "#ffffff",
                                            border: "1px solid #2a2a2a",
                                            borderRadius: "8px",
                                            padding: "10px 18px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            letterSpacing: "0.04em",
                                            cursor: "pointer",
                                            transition: "opacity 0.15s",
                                            height: "40px",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        Manage Muscles
                                    </button>
                                </div>

                               
                                {calculateMessage ? (
                                    <div
                                        style={{
                                            marginBottom: "16px",
                                            borderRadius: "8px",
                                            border: "1px solid #2a2a2a",
                                            backgroundColor: "#1a1a1a",
                                            padding: "12px 16px",
                                            fontSize: "12px",
                                            color: "#a1a1aa",
                                        }}
                                    >
                                        {calculateMessage}
                                    </div>
                                ) : null}
                                {calculateErrors.length > 0 ? (
                                    <div
                                        style={{
                                            marginBottom: "24px",
                                            borderRadius: "8px",
                                            border: "1px solid rgba(239,68,68,0.3)",
                                            backgroundColor: "rgba(239,68,68,0.08)",
                                            padding: "12px 16px",
                                            fontSize: "12px",
                                            color: "#fca5a5",
                                        }}
                                    >
                                        {calculateErrors.map((error, index) => (
                                            <div key={`${error}-${index}`}>{error}</div>
                                        ))}
                                    </div>
                                ) : null}

                                <VolumeOverview
                                    weekName={data?.result.weekname || []}
                                    id={id || ""}
                                    onWeekChange={({ weekId, weekNumber, isFinalWeek }) => {
                                        setSelectedWeekId(weekId)
                                        setSelectedWeekNumber(weekNumber)
                                        setSelectedWeekIsFinal(isFinalWeek)
                                        setCalculateMessage("")
                                        setCalculateErrors([])
                                    }}
                                />
                            </div>

                            {showMuscleManager && selectedWeekId && (
                                <MuscleManager
                                    weekId={selectedWeekId.toString()}
                                    onClose={() => setShowMuscleManager(false)}
                                />
                            )}

                        </div>
                    </div>
                )
            }
        </>


    );

}
