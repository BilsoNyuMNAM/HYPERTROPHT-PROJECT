import Volumecard from "../components/Volumecard"
import { useState } from "react"
import Frequencycard from "../components/Frequencycard"
import { useNavigate } from "react-router-dom"
import { Post } from "../service/centralisedApi.js"

function Volume({ volume, setVolume }: { volume: any; setVolume: any }) {
    const musclename: string[] = [
        "back",
        "chest",
        "legs",
        "biceps",
        "triceps",
        "hamstrings",
        "abs",
        "front delts",
        "side delts",
        "rear delts",
        "glutes",
        "calves",
    ]
    return (
        <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                    Starting Volume
                </h2>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                    Sets per week. Recommended: 6-12 sets per week per muscle.
                </p>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "8px",
                    maxHeight: "45vh",
                    overflowY: "auto",
                    paddingRight: "8px",
                }}
            >
                <Volumecard muscleGroup={musclename} volume={volume} setVolume={setVolume} />
            </div>
        </div>
    )
}

function Frequency({ frequency, setFrequency }: { frequency: any; setFrequency: any }) {
    return (
        <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                    Training Frequency
                </h2>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                    How many times per week will you train each muscle group?
                </p>
            </div>
            <div
                style={{
                    maxHeight: "45vh",
                    overflowY: "auto",
                    paddingRight: "8px",
                }}
            >
                <Frequencycard frequency={frequency} setFrequency={setFrequency} />
            </div>
        </div>
    )
}

function MesocycleOverview({
    mesocycleName,
    setMesocycleName,
    numberOfweeks,
    setnumberOfweeks,
}: {
    mesocycleName: string
    setMesocycleName: any
    numberOfweeks: number
    setnumberOfweeks: React.Dispatch<React.SetStateAction<number>>
}) {
    return (
        <div>
            <div style={{ padding: "24px", borderBottom: "1px solid #1e1e1e" }}>
                <div style={{ marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                        Name of your Mesocycle
                    </h2>
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>
                        Give this training block a name (e.g. bulk1, hypertrophy-block)
                    </p>
                </div>
                <div>
                    <label
                        style={{
                            fontSize: "11px",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#6b7280",
                            fontWeight: 500,
                            display: "block",
                            marginBottom: "8px",
                        }}
                    >
                        Mesocycle Name
                    </label>
                    <input
                        type="text"
                        value={mesocycleName}
                        onChange={(e) => setMesocycleName(e.target.value)}
                        style={{
                            width: "100%",
                            backgroundColor: "#111111",
                            border: "1px solid #2a2a2a",
                            borderRadius: "8px",
                            height: "40px",
                            padding: "0 14px",
                            fontSize: "14px",
                            color: "#ffffff",
                            outline: "none",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                        }}
                        placeholder="bulk1"
                    />
                </div>
            </div>
            <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                        Number of Weeks
                    </h2>
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>
                        How many progressive weeks should this mesocycle last?
                    </p>
                </div>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <button
                        disabled={numberOfweeks === 4}
                        onClick={() => {
                            setnumberOfweeks((prev) => prev - 1)
                        }}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            border: "1px solid #2a2a2a",
                            backgroundColor: "#111111",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: numberOfweeks === 4 ? "not-allowed" : "pointer",
                            opacity: numberOfweeks === 4 ? 0.45 : 1,
                            fontSize: "16px",
                        }}
                    >
                        -
                    </button>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", minWidth: "70px", textAlign: "center" }}>
                        {numberOfweeks} weeks
                    </span>
                    <button
                        onClick={() => {
                            setnumberOfweeks((prev) => Math.min(12, prev + 1))
                        }}
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            border: "1px solid #2a2a2a",
                            backgroundColor: "#111111",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: numberOfweeks === 12 ? "not-allowed" : "pointer",
                            opacity: numberOfweeks === 12 ? 0.45 : 1,
                            fontSize: "16px",
                        }}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function CreateMesocycle() {
    const [currentStep, setCurrentStep] = useState(1)
    const navigate = useNavigate()
    const [isLoading, setisLoading] = useState(false)
    const [mesocycleName, setMesocycleName] = useState("")
    const isDisabled = !mesocycleName
    const [numberOfweeks, setnumberOfweeks] = useState(4)
    const [volume, setVolume] = useState({
        back: 8,
        chest: 8,
        biceps: 8,
        triceps: 8,
        abs: 8,
        "front delts": 8,
        "side delts": 8,
        "rear delts": 8,
        legs: 8,
        glutes: 8,
        calves: 8,
        hamstrings: 8,
    })
    const [frequency, setFrequency] = useState([
        { back: 2 },
        { biceps: 2 },
        { chest: 2 },
        { triceps: 2 },
        { "front delts": 2 },
        { "side delts": 2 },
        { "rear delts": 2 },
        { legs: 2 },
        { abs: 2 },
        { glutes: 2 },
        { calves: 2 },
        { hamstrings: 2 },
    ])

    async function handleSubmit() {
        setisLoading(true)
        const volumeArray = Object.entries(volume).map(([muscle, sets]) => ({
            muscle_name: muscle,
            set: sets,
        }))

        const frequencyArray = frequency.map((f) => {
            const [muscle, timesPerWeek] = Object.entries(f)[0]
            return { muscle_name: muscle, timesPerWeek }
        })
        const payload = {
            name: mesocycleName,
            volume: volumeArray,
            frequencies: frequencyArray,
            numberOfweeks: numberOfweeks,
        }
        try {
            const response = await Post("/mesoCycle/create", payload)
            if (response.status === 401) {
                window.alert("Unauthorized. Please log in again.")
                navigate("/signup")
                return
            }
            if (!response.ok) {
                window.alert("Failed to create mesocycle. Please try again.")
                return
            }
            navigate("/Allmesocycle")
        } catch (error) {
            window.alert("Failed to create mesocycle. Please try again.")
        } finally {
            setisLoading(false)
        }
    }

    return (
        <div
            className="w-full h-screen overflow-y-auto"
            style={{
                backgroundColor: "#0f0f0f",
                color: "#ffffff",
                fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "600px",
                    margin: "0 auto",
                    padding: "40px 24px",
                }}
            >
                {/* ── NAV / CANCEL ── */}
                <nav style={{ marginBottom: "32px" }}>
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
                        Back
                    </button>
                </nav>

                {/* ── CARD PANEL CONTAINER ── */}
                <div
                    style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: "12px",
                        padding: "24px 0",
                    }}
                >
                    {/* Stepper Header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 24px 20px 24px",
                            borderBottom: "1px solid #1e1e1e",
                        }}
                    >
                        {/* Step 1 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                }}
                            >
                                1
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: currentStep === 1 ? 600 : 400, color: currentStep === 1 ? "#ffffff" : "#6b7280" }}>
                                Overview
                            </span>
                        </div>

                        {/* Line 1-2 */}
                        <div style={{ flex: 1, height: "1px", backgroundColor: currentStep >= 2 ? "#ffffff" : "#2a2a2a", margin: "0 12px" }}></div>

                        {/* Step 2 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    backgroundColor: currentStep >= 2 ? "#ffffff" : "#111111",
                                    color: currentStep >= 2 ? "#000000" : "#6b7280",
                                    border: currentStep >= 2 ? "none" : "1px solid #2a2a2a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                }}
                            >
                                2
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: currentStep === 2 ? 600 : 400, color: currentStep === 2 ? "#ffffff" : "#6b7280" }}>
                                Volume
                            </span>
                        </div>

                        {/* Line 2-3 */}
                        <div style={{ flex: 1, height: "1px", backgroundColor: currentStep >= 3 ? "#ffffff" : "#2a2a2a", margin: "0 12px" }}></div>

                        {/* Step 3 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    backgroundColor: currentStep >= 3 ? "#ffffff" : "#111111",
                                    color: currentStep >= 3 ? "#000000" : "#6b7280",
                                    border: currentStep >= 3 ? "none" : "1px solid #2a2a2a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                }}
                            >
                                3
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: currentStep === 3 ? 600 : 400, color: currentStep === 3 ? "#ffffff" : "#6b7280" }}>
                                Frequency
                            </span>
                        </div>
                    </div>

                    {/* Step Body */}
                    {currentStep === 1 ? (
                        <MesocycleOverview
                            mesocycleName={mesocycleName}
                            setMesocycleName={setMesocycleName}
                            numberOfweeks={numberOfweeks}
                            setnumberOfweeks={setnumberOfweeks}
                        />
                    ) : currentStep === 2 ? (
                        <Volume volume={volume} setVolume={setVolume} />
                    ) : (
                        <Frequency frequency={frequency} setFrequency={setFrequency} />
                    )}

                    {/* Navigation Buttons inside Panel */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "20px 24px 0 24px",
                            borderTop: "1px solid #1e1e1e",
                        }}
                    >
                        <button
                            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                            disabled={currentStep <= 1}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#1a1a1a",
                                color: currentStep <= 1 ? "#3f3f46" : "#ffffff",
                                border: "1px solid #2a2a2a",
                                borderRadius: "8px",
                                padding: "8px 18px",
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: currentStep <= 1 ? "not-allowed" : "pointer",
                                opacity: currentStep <= 1 ? 0.45 : 1,
                                height: "36px",
                                fontFamily: "inherit",
                                transition: "color 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={e => {
                                if (currentStep > 1) {
                                    e.currentTarget.style.color = "#ffffff"
                                    e.currentTarget.style.borderColor = "#3f3f46"
                                }
                            }}
                            onMouseLeave={e => {
                                if (currentStep > 1) {
                                    e.currentTarget.style.color = "#ffffff"
                                    e.currentTarget.style.borderColor = "#2a2a2a"
                                }
                            }}
                        >
                            Back
                        </button>

                        {currentStep === 3 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "8px 18px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    height: "36px",
                                    fontFamily: "inherit",
                                }}
                            >
                                {isLoading ? (
                                    <div
                                        style={{
                                            width: "14px",
                                            height: "14px",
                                            border: "2px solid #000000",
                                            borderTopColor: "transparent",
                                            borderRadius: "50%",
                                            animation: "spin 0.7s linear infinite",
                                        }}
                                    />
                                ) : (
                                    "Create Mesocycle"
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentStep((prev) => prev + 1)}
                                disabled={isDisabled}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isDisabled ? "#2a2a2a" : "#ffffff",
                                    color: isDisabled ? "#6b7280" : "#000000",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "8px 18px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                    opacity: isDisabled ? 0.45 : 1,
                                    height: "36px",
                                    fontFamily: "inherit",
                                }}
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
