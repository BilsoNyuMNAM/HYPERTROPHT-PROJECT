import { useState, useEffect, useRef } from "react"
import Workoutheader from "../components/Workoutheader"
import Setcard, { muscleNames } from "../components/setComponent"
import CalendarModal from "../components/calender"
import Feedback from "../components/feedback"
import { useParams } from "react-router-dom"
import copySessionData from "../helper/copySessiondata"
import useWorkoutDay from "../helper/useWorkoutDay"
import ErrorState from "../components/ErrorState"
import {Post} from "../src/service/centralisedApi.js"
import ToastDialog from "../components/ToastDialog"
import { Loader2, Check } from "lucide-react"

export default function WorkoutUi() {
   const { mesocycleId, weeknumber, daynumber } = useParams()
    
    const {setSessiondata,sessionData} = useWorkoutDay(); //holds the current session oBject - any changes for the day happens in this state variable 
    const [showSorenessSection, setSorenessSection] = useState(false) //decides if the soreness section of the feedback should be shown or not 
    const [data, setData] = useState<any>(null) //stores all the data from week 1 to week N
    const [loading, setLoading] = useState(true)
    const [loadingError, setLoadingError] = useState<string | null>(null)
    const [isCalenderopen, setOpen] = useState(false)
    const [feedbackMuscle, setFeedbackMuscle] = useState<string | null>(null)
    const [promptMessage, setPromptMessage] = useState<string | null>(null)
    const [replacePrompt, setReplacePrompt] = useState<{ oldId: number; newExercise: any } | null>(null)
    const [isCompleting, setIsCompleting] = useState(false)
    
    const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    function showPrompt(msg: string) {
        if (promptTimerRef.current) {
            clearTimeout(promptTimerRef.current)
        }
        setPromptMessage(msg)
        promptTimerRef.current = setTimeout(() => {
            setPromptMessage(null)
            promptTimerRef.current = null
        }, 3000)
    }

    useEffect(() => {
        return () => {
            if (promptTimerRef.current) {
                clearTimeout(promptTimerRef.current)
            }
        }
    }, [])

    function updateSet(setId, field, value){
        
        const updatedSessiondata =  {...sessionData,
            sessionexercise:sessionData.sessionexercise.map((element:any)=>({
                ...element, 
                set: element.set.map((eachset:any)=>{
                    return (eachset.id == setId)?{...eachset, [field]:value}: eachset
                })
            }))
        } 
        console.log("updated session data:",sessionData)
        setSessiondata(updatedSessiondata)
    }


    //check if  a muscle is traning for the first time or not, 
    function hasMuscleTrainedBefore(muscleId: number, data: any, weeknumber , daynumber) {
    // 1. Get only workouts from the past
        const filterSessions = data.sessions.filter(element => {
            if (element.weeknumber <= Number(weeknumber)) {//if the seession is previous week 
                if (element.weeknumber == Number(weeknumber)) { //if the seesion is from same week , enter this condition
                    return element.daynumber < Number(daynumber)
                }
                return true
            }
            return false // for those who does not satisfy : element.weeknumber <= Number(weeknumber (discard those session)
        })

    // 2. Check if any completed past workout trained this muscle
        const result = filterSessions.some(element => {
            if (element.status == "completed") { //if a session has status complete , get inside that session object and see if the session has any set where it has muscleId
                return element.sessionexercise.some(eachobject => {
                    return eachobject.exercise.muscleGroupId == muscleId
                })
            }
            return false
        })

        return result
    }

    function competeSet(setId){ /*
        1.when the checkbox is clicked , marked it complete or pending  according to the condition inside the function
        2. check if if it is the last set for the muscle of the session, if so trigger the feedback ui 
        */ 

        //1.
        const updatedSession = {
            ...sessionData,
            sessionexercise: sessionData.sessionexercise.map((exercise: any) => ({
                ...exercise,
                set: exercise.set.map((eachset: any) =>
                    eachset.id === setId
                        ? { ...eachset, status: eachset.status === "completed" ? "pending" : "completed" }
                        : eachset
                ),
            })),
        }

        setSessiondata(updatedSession)

        //2.
        const clickedExercise = updatedSession.sessionexercise.find((exercise: any) => //return that set object where === setId
            exercise.set.some((eachset: any) => eachset.id === setId)
        )
        if (!clickedExercise) return

        const muscleId = clickedExercise.exercise.muscleGroupId

        //Check if all sets for that muscle are finished
        const allSetsComplete = updatedSession.sessionexercise
            .filter((exercise: any) => exercise.exercise.muscleGroupId === muscleId)
            .every((exercise: any) => exercise.set.every((eachset: any) => eachset.status === "completed"))

        if (allSetsComplete) {
            const result = hasMuscleTrainedBefore(muscleId, data, weeknumber, daynumber)
            setSorenessSection(result) // true → show soreness, false → skip it
            setFeedbackMuscle(muscleNames[muscleId])
        }     

    }

    //this function add or update `musclefeedback` state to the feedback key in sessionData
    function updateFeedback(feedbackobject){
        const check = sessionData.feedback.find((object: any) => object.muscleId === feedbackobject.muscleId) //return that feedhback object if the condition is met 

        if (check == undefined) { //if there is none that means the feedback object of the muscle is not there 
            setSessiondata({ ...sessionData, feedback: [...sessionData.feedback, feedbackobject] })
        } else {
            setSessiondata({ //it already had , then replace that object and dont touch other object 
                ...sessionData,
                feedback: sessionData.feedback.map((object: any) =>
                    object.muscleId === feedbackobject.muscleId ? feedbackobject : object
                ),
            })
        }
    }

    function deleteSet(setID:number, exerciseId:number){
        setSessiondata({
            ...sessionData,
            sessionexercise: sessionData.sessionexercise.map((exercisebject)=>
                exercisebject.id == exerciseId
                    ? {...exercisebject, set: exercisebject.set.filter((s)=> s.id != setID)}
                    : exercisebject
            )
        })
        console.log(sessionData)
    }

    function addSet(exerciseId) {
        setSessiondata({
            ...sessionData,
            sessionexercise: sessionData.sessionexercise.map((exercise: any) => {
                if (exercise.id !== exerciseId) return exercise
                const last = exercise.set[exercise.set.length - 1]
                return {
                    ...exercise,
                    set: [
                        ...exercise.set,
                        {
                            ...last,
                            id: crypto.randomUUID(),
                            setNumber: exercise.set.length + 1,
                            weight: exercise.set[exercise.set.length -1].weight,
                            reps: exercise.set[exercise.set.length -1].reps,
                            rir: exercise.set[exercise.set.length -1].rir,
                            status: "pending",
                        },
                    ],
                }
            }),
        })
    }

   
    //called by Setcard when the user picks a new exercise. Ask for the scope before applying.
    function replaceExercise(oldId: number, newExercise: any) {
        setReplacePrompt({ oldId, newExercise })
    }

    //current-session scope: swap the exercise and blank the sets, keeping the same number of sets
    function replaceForThisSession() {
        if (!replacePrompt) return
        const { oldId, newExercise } = replacePrompt
        setSessiondata({
            ...sessionData,
            sessionexercise: sessionData.sessionexercise.map((exercise: any) =>
                exercise.exerciseId === oldId
                    ? {
                        ...exercise,
                        exerciseId: newExercise.id, //{"id": 116, "name": "Barbell Facepull","muscleGroupId": 5}
                        exercise: newExercise,
                        set: exercise.set.map((eachset: any) => ({
                            ...eachset,
                            weight: null,
                            reps: null,
                            rir: null,
                            status: "pending",
                        })),
                    }
                    : exercise
            ),
        })
        setReplacePrompt(null)
    }

    //remaining-weeks scope: persist the swap for every pending session from this day to the end of the mesocycle
    async function replaceTheRemainingWeek() {
        if (!replacePrompt) return
        const { oldId, newExercise } = replacePrompt

        const response = await Post("/training/replace", {
            oldId,
            newId: newExercise.id,
            mesocycleId: Number(mesocycleId),
            weeknumber: Number(weeknumber),
            daynumber: Number(daynumber),
        }).catch(() => null)

        if (!response) {
            showPrompt("Failed to reach server")
            return
        }

        const result = await response.json().catch(() => null)

        if (response.status !== 200) {
            showPrompt(result?.message || `Replace failed (${response.status})`)
            setReplacePrompt(null)
            return
        }

        replaceForThisSession() //this day's card, plus its saved draft, now holds the new exercise
        await fetchAllweekdata(true) //refresh the other weeks without blanking the screen
        showPrompt(result?.message || "Exercise replaced for the remaining weeks")
    }

    

    //this function send the session data to the server
    async function sendData(){
        if (isCompleting) return
        setIsCompleting(true)
        try {
            const response = await Post("/mesocycles/complete", sessionData)
            const result = await response.json().catch(() => null)
            const message = result?.message || `Status: ${response.status}`

            if (response.status === 200) {
                localStorage.removeItem(storageKey)
                setSessiondata((prev: any) => ({ ...prev, status: "completed" }))
                setData((prev: any) => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        sessions: prev.sessions?.map((s: any) =>
                            s.id === sessionData.id ? { ...s, status: "completed" } : s
                        )
                    }
                })
                showPrompt(message)
            } else if (response.status === 404) {
                showPrompt(message)
            } else if (response.status === 409) {
                setSessiondata((prev: any) => ({ ...prev, status: "completed" }))
                showPrompt(message)
            } else if (response.status === 500) {
                showPrompt(message)
            } else {
                showPrompt(message)
            }
        } catch (error) {
            showPrompt(error instanceof Error ? error.message : "Failed to connect to server")
        } finally {
            setIsCompleting(false)
        }
    }



    async function fetchAllweekdata(silent = false) {
        if (!silent) {
            setLoading(true)
            setLoadingError(null)
        }
        try {
            //@ts-ignore
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mesocycles/all/${mesocycleId}`)
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`)
            }
            const result = await response.json()
            if (!Array.isArray(result?.sessions)) {
                throw new Error("Mesocycle data did not include any sessions")
            }
            setData(result)
        } catch (error) {
            if (!silent) {
                setLoadingError(error instanceof Error ? error.message : "Failed to load this mesocycle")
            }
        } finally {
            if (!silent) {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        
        fetchAllweekdata() //when the components renders for call this function which fetches all the weeks datas
    }, [mesocycleId])

    

    const currentSession = data?.sessions?.find( //get the current session
        (element: any) => element.weeknumber == weeknumber && element.daynumber == daynumber
    )

    const storageKey = `workout-${mesocycleId}-${weeknumber}-${daynumber}`

    useEffect(() => { //call the settter once and recall when the current session chages otherwise there will be infinite loop 
        if(!currentSession){
            return
        } 
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            try {
                setSessiondata(JSON.parse(saved)) //saved copy wins, it holds the user's progress
                return
            } catch {
                localStorage.removeItem(storageKey) //corrupt entry, fall back to the server copy
            }
        }
        setSessiondata(copySessionData(currentSession))
         
    }, [currentSession, storageKey])

    useEffect(()=>{
        if (!sessionData) return //nothing loaded yet, do not overwrite the saved copy
        localStorage.setItem(storageKey, JSON.stringify(sessionData))
    },[sessionData, storageKey])



    if (loadingError) {
        return <ErrorState message={loadingError} onRetry={() => fetchAllweekdata()} />
    }

    if (loading || (sessionData == undefined)) {
        return <p className="min-h-screen bg-[#000000] text-[#8a8a8a] p-6 sm:p-10">Loading..</p>
    }
    
   


    if (!currentSession) {
        return <p className="min-h-screen bg-[#000000] text-[#8a8a8a] p-6 sm:p-10">No session on this day</p>
    }

    const totalWeeks = Math.max(...data.sessions.map((session: any) => session.weeknumber))
    const isSessionCompleted = sessionData?.status === "completed" || currentSession?.status === "completed"

    return (
        <div className="min-h-screen w-full bg-[#000000] text-[#ededed] px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto w-full max-w-[36rem]">
                <Workoutheader
                    name={data?.mesoname}
                    weeknumber={Number(weeknumber)}
                    daynumber={Number(daynumber)}
                    label={currentSession.label}
                    openCloseCalender={setOpen}
                    isCalenderopen={isCalenderopen}
                />

                <div className="mt-6 flex flex-col gap-3">
                    {sessionData.sessionexercise.map((exerciseobject: any, index: number) => (
                        <Setcard key={exerciseobject.id} exerciseData={exerciseobject} updateSet={updateSet} competeSet={competeSet} deleteSet={deleteSet} addSet={addSet} replaceExercise={replaceExercise} />
                    ))}
                </div>

                <div className="mt-8">
                    <button
                        type="button"
                        disabled={isCompleting || isSessionCompleted}
                        className={`group flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-[15px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000] ${
                            isSessionCompleted
                                ? "border border-green-700/60 bg-neutral-900 text-green-400 cursor-not-allowed shadow-[0_0_20px_-10px_rgba(34,197,94,0.3)]"
                                : isCompleting
                                ? "bg-red-800 text-white cursor-not-allowed opacity-80"
                                : "bg-red-600 text-white hover:bg-red-500 active:translate-y-px shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_30px_-12px_rgba(220,38,38,0.9)]"
                        }`}
                        onClick={sendData}
                    >
                        {isCompleting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Completing workout...</span>
                            </>
                        ) : isSessionCompleted ? (
                            <>
                                <Check className="h-5 w-5 text-green-400 stroke-[2.5]" />
                                <span>Completed</span>
                            </>
                        ) : (
                            "Complete workout"
                        )}
                    </button>
                </div>
            </div>

            {feedbackMuscle && (
                <Feedback
                    muscleName={feedbackMuscle}
                    onClose={() => setFeedbackMuscle(null)}
                    updateFeedback={updateFeedback}
                    showSorenessSection={showSorenessSection}
                />
            )}

            {isCalenderopen && (
                <CalendarModal
                    onClose={() => setOpen(false)}
                    sessions={data.sessions}
                    totalWeeks={totalWeeks}
                    currentWeek={Number(weeknumber)}
                    currentDay={Number(daynumber)}
                    mesocycleId={String(mesocycleId)}
                />
            )}

            

            {replacePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setReplacePrompt(null)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="replace-scope-title"
                        className="relative w-full max-w-sm rounded-2xl border border-[#222222] bg-[#0a0a0a] p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="replace-scope-title" className="text-base font-semibold text-[#ededed]">Replace exercise?</h2>
                        <p className="mt-1 text-sm text-[#8a8a8a]">
                            Apply <span className="text-[#ededed]">{replacePrompt.newExercise.name}</span> to the remaining week or just this session?
                        </p>
                        <div className="mt-5 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={replaceTheRemainingWeek}
                                className="w-full rounded-lg border border-[#222222] py-2.5 text-sm font-semibold text-[#ededed] transition-colors hover:border-[#333333] hover:bg-[#141414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60"
                            >
                                Remaining week
                            </button>
                            <button
                                type="button"
                                onClick={replaceForThisSession}
                                className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed]"
                            >
                                Just this session
                            </button>
                            <button
                                type="button"
                                onClick={() => setReplacePrompt(null)}
                                className="w-full rounded-lg py-2.5 text-sm font-semibold text-[#8a8a8a] transition-colors hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastDialog message={promptMessage} />
        </div>
    )
}
