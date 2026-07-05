import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import Dimmer from "../components/Dimmer"
import { useSession } from "../hooks/useSession"
import Exercisecomponent from "./Exercisecomponent"
import { Spinner } from "../components/ui/spinner"


type set = {
    id:number,
    reps:string,
    weight:string,
    rir:string
}

// The muscle list is now derived dynamically inside the component.

export default function Sessionpage(){
    const {sessionId}= useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [showDimmer, setShowDimmer] = useState(false)
    const { weekId, mesoId } = (location.state as { weekId?: string; mesoId?: string }) || {}
    const [searchParams] = useSearchParams();
    const weeknumber = searchParams.get("weeknumber") || ""

    function validateSession(exercise: any): string | null {
    if (exercise.length === 0) { // trigger if there is no exercise added 
        return "Please add at least one exercise"  
    }
    //trigger if there is any empty field in the exercise or set
        const hasEmpty = exercise.some(ex => {
            return ex.exercise_name.trim() === "" || ex.muscletrained.trim() === "" || ex.set.some(set => {
                return set.reps === "" || set.weight === "" || set.rir === ""
            })
        })

    if (hasEmpty) { //if  there is an empty field in the exerise, return this 
        return "Please fill in all fields"  
    }

    return null  // else do nothing and return null
    }
    
    if (!weekId || !mesoId || !sessionId) {
        navigate(-1)
        return null
    }
    
    const {isLoading, Addexercise, MUSCLE_COLORS, addexercise, persistableExercises, Selecttrainedmuscle, exerciseName, addsetData, addSet, deleteSet, deleteExercise, sessionName, submitSession, apiCall, setApiCall, logSoreness, logPerformanceByMuscle, refreshSessionData, weeklySetSummary, weeklySetSummarySeed} = useSession({sessionId, weekId, mesoId, weeknumber})
    
    function calculateSetsLeftForMuscle(muscletrained: string): number | null {
        const muscleSummary = weeklySetSummary.find(row => row.muscleName === muscletrained)
        if (!muscleSummary || !muscleSummary.hasTarget) return null
        return muscleSummary.setsLeft
    }

    function getMuscleSetsLeft(muscleName: string): number | null {
        const normalizedName = muscleName.trim().toLowerCase()
        const summaryRow = weeklySetSummary.find(
            row => row.muscleName.trim().toLowerCase() === normalizedName
        )
        if (summaryRow) {
            return summaryRow.hasTarget ? summaryRow.setsLeft : null
        }
        const seedRow = weeklySetSummarySeed.find(
            row => row.muscleName.trim().toLowerCase() === normalizedName
        )
        if (seedRow) {
            return seedRow.targetSets - seedRow.completedSetsOutsideSession
        }
        return null
    }
    
  
    const [currentDropdown, setCurrentDropdown] = useState<number | null>(null);    
    const [isOpen, setOpen]= useState(false)

    const sorenessFeedbackMuscles = useMemo(() => {
    return Array.from(
        new Set(
            (persistableExercises as any[])
                .filter((exercise) => {
                    return (
                        typeof exercise?.muscletrained === "string" &&
                        exercise.muscletrained.trim() !== "" &&
                        Object.prototype.hasOwnProperty.call(exercise, "soreness") && !exercise.performance
                        
                    )
                })
                .map((exercise) => exercise.muscletrained)
        )
    )
    }, [persistableExercises])
    

    const activeMuscles = useMemo(() => {
        // Find all muscles from the seed that have a targetSets > 0
        const seedMuscles = weeklySetSummarySeed
            .filter((seed) => seed.targetSets > 0)
            .map((seed) => seed.muscleName.toLowerCase());

        // We still check against MUSCLE_COLORS to ensure we have the color mapping
        return Object.keys(MUSCLE_COLORS).filter((muscle) => 
            seedMuscles.includes(muscle.toLowerCase())
        );
    }, [weeklySetSummarySeed, MUSCLE_COLORS]);

    return(
        <>
        {isLoading ? (
            <div
                className="w-full min-h-screen flex items-center justify-center"
                style={{ backgroundColor: "#0f0f0f" }}
            >
                <Spinner className="w-8 h-8 text-white" />
            </div>
        ) : (
            <div
                className="h-screen w-full overflow-y-auto"
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
                            onClick={() => {
                                navigate(-1) // go back to the previous page which is the week page 
                                    
                            }}
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
                            Back to Session
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
                            Session
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
                                {sessionName}
                            </h1>
                            <button
                                onClick={() => {
                                    const error = validateSession(addexercise)
                                        if (error) {
                                            alert(error)          
                                        } else {
                                            setShowDimmer(true)  
                                        }
                                }}
                                style={{
                                    flexShrink: 0,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "10px 20px",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    letterSpacing: "0.02em",
                                    cursor: "pointer",
                                    height: "40px",
                                    fontFamily: "inherit",
                                    transition: "opacity 0.15s",
                                    marginTop: "6px",
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                            >
                                Save Session
                            </button>
                        </div>
                    </div>

                    
                    <div style={{ height: "1px", backgroundColor: "#1e1e1e", margin: "0 40px" }} />

                  
                    <div className="px-10 py-8" style={{ paddingBottom: "80px" }}>

                       
                        {weeklySetSummary.length > 0 ? (
                            <div
                                style={{
                                    marginBottom: "32px",
                                    borderRadius: "12px",
                                    border: "1px solid #2a2a2a",
                                    backgroundColor: "#1a1a1a",
                                    padding: "20px",
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            letterSpacing: "0.12em",
                                            textTransform: "uppercase",
                                            color: "#6b7280",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Weekly Sets Left
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "10px",
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            color: "#3f3f46",
                                        }}
                                    >
                                        Current session included
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {weeklySetSummary.map((summary) => {
                                        const isOverTarget = summary.hasTarget && summary.setsLeft < 0
                                        return (
                                            <div
                                                key={summary.muscleName}
                                                style={{
                                                    borderRadius: "8px",
                                                    border: isOverTarget
                                                        ? "1px solid rgba(249,115,22,0.35)"
                                                        : "1px solid #2a2a2a",
                                                    backgroundColor: isOverTarget
                                                        ? "rgba(249,115,22,0.06)"
                                                        : "#111111",
                                                    padding: "10px 14px",
                                                    minWidth: "110px",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        fontSize: "10px",
                                                        letterSpacing: "0.08em",
                                                        textTransform: "uppercase",
                                                        color: "#6b7280",
                                                        marginBottom: "4px",
                                                    }}
                                                >
                                                    {summary.muscleName}
                                                </p>
                                                {summary.hasTarget ? (
                                                    <p
                                                        style={{
                                                            fontSize: "14px",
                                                            fontWeight: 600,
                                                            color: isOverTarget ? "#fb923c" : "#ffffff",
                                                        }}
                                                    >
                                                        {isOverTarget
                                                            ? `${Math.abs(summary.setsLeft)} over`
                                                            : `${summary.setsLeft} left`}
                                                    </p>
                                                ) : (
                                                    <p style={{ fontSize: "12px", color: "#3f3f46" }}>
                                                        no limit
                                                    </p>
                                                )}
                                                {summary.hasTarget && (
                                                    <p
                                                        style={{
                                                            fontSize: "10px",
                                                            color: "#3f3f46",
                                                            marginTop: "2px",
                                                        }}
                                                    >
                                                        {summary.completedSets}/{summary.targetSets} sets
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : null}

                        
                        <div>
                            {addexercise.length === 0 ? (
                                <div
                                    style={{
                                        padding: "40px 24px",
                                        textAlign: "center",
                                        color: "#3f3f46",
                                        fontSize: "14px",
                                    }}
                                >
                                    No exercises yet — add your first one below
                                </div>
                            ) : (
                                addexercise.map((exercise) => (
                                    //@ts-ignore
                                    <Exercisecomponent
                                        key={exercise.id}
                                        setsLeft={calculateSetsLeftForMuscle(exercise.muscletrained)}
                                        logSoreness={logSoreness}
                                        muscletrained={exercise.muscletrained}
                                        MUSCLE_COLORS={MUSCLE_COLORS}
                                        muscle={activeMuscles}
                                        currentDropdown={currentDropdown}
                                        setCurrentDropdown={setCurrentDropdown}
                                        isOpen={isOpen}
                                        setOpen={setOpen}
                                        exercise_name={exercise.exercise_name}
                                        id={exercise.id}
                                        exerciseName={exerciseName}
                                        addset={addSet}
                                        deleteSet={deleteSet}
                                        deleteExercise={deleteExercise}
                                        set={exercise.set}
                                        addsetData={addsetData}
                                        Selecttrainedmuscle={Selecttrainedmuscle}
                                        apiCall={apiCall}
                                        setApiCall={setApiCall}
                                        weekId={weekId}
                                        mesoId={mesoId}
                                        existingSoreness={exercise.soreness}
                                        getMuscleSetsLeft={getMuscleSetsLeft}
                                    />
                                ))
                            )}
                        </div>

                        
                        <button
                            onClick={() => { Addexercise() }}
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
                            Add Exercise
                        </button>
                    </div>
                </div>

                {showDimmer ? (
                    <Dimmer
                        setShowDimmer={setShowDimmer}
                        musclesForPerformance={sorenessFeedbackMuscles}
                        onRatePerformance={logPerformanceByMuscle}
                        onSaveSession={submitSession}
                        onBackToSession={async () => {
                            await refreshSessionData()
                            setShowDimmer(false)
                        }}
                    />
                ) : null}
            </div>
        )}
        </>
    )
}
