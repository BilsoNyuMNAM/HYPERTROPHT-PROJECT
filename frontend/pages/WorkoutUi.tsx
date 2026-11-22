import { useState, useEffect, useRef } from "react"
import Workoutheader from "../components/Workoutheader"
import Setcard, { muscleNames } from "../components/setComponent"
import CalendarModal from "../components/calender"
import SummaryModal from "../components/summary"
import Feedback from "../components/feedback"
import { useParams } from "react-router-dom"
import copySessionData from "../helper/copySessiondata"
import useWorkoutDay from "../helper/useWorkoutDay"
import ErrorState from "../components/ErrorState"
import {Post} from "../src/service/centralisedApi.js"
import ToastDialog from "../components/ToastDialog"
import { Loader2, Check, Plus } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import AddExercise from "./Addexercise"
export default function WorkoutUi() {
   const { mesocycleId, weeknumber, daynumber } = useParams()
    
    const {setSessiondata,sessionData} = useWorkoutDay(); //holds the current session oBject - any changes for the day happens in this state variable 
    const [showSorenessSection, setSorenessSection] = useState(false) //decides if the soreness section of the feedback should be shown or not 
    //stores all the data from week 1 to week N
    // const [loading, setLoading] = useState(true)
    // const [loadingError, setLoadingError] = useState<string | null>(null)

    const {data, isPending, isError, error, refetch} = useQuery({
        queryKey:["allweeksdata", mesocycleId],
        queryFn: async ()=>{
            const result = await fetch(`${import.meta.env.VITE_API_URL}/mesocycles/all/${mesocycleId}`)
            if(!result.ok){
                const errorObject = await result.json()
                throw new Error(errorObject.error)
            }
            const jsonResult = await result.json()
            return jsonResult

        }
    })
    const queryClient = useQueryClient()




    const [isCalenderopen, setOpen] = useState(false)
    const [isSummaryOpen, setSummaryOpen] = useState(false)
    const [feedbackMuscle, setFeedbackMuscle] = useState<string | null>(null)
    const [promptMessage, setPromptMessage] = useState<string | null>(null)
    const [replacePrompt, setReplacePrompt] = useState<{ oldId: number; newExercise: any } | null>(null)
    const [deletePrompt, setDeletePrompt] = useState<{ exerciseId: number; exerciseName: string } | null>(null)
    const [isCompleting, setIsCompleting] = useState(false)
    const [isAddexerciseOpen, setOpenorClose]= useState(false)

    const prompt = "Change the weight if you want. Just keep the reps inside the target RIR — the rep number is only a recommendation."
    
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


    //after the user leaves the weight cell, ask the backend for the target reps of that weight
    async function recalculateReps(setId: number) {
        if (Number(weeknumber) < 2) return //progression starts from week 2
        if (typeof setId !== "number") return //a set added today has no last week row

        const exercise = sessionData.sessionexercise.find((element: any) => element.set.some((eachset: any) => eachset.id === setId))
        const targetSet = exercise?.set.find((eachset: any) => eachset.id === setId)
        if (!exercise || !targetSet) return

        const selectedWeight = Number(targetSet.weight)
        if (!targetSet.weight || Number.isNaN(selectedWeight) || selectedWeight <= 0) return

        try {
            const response = await Post("/training/reps", {
                mesocycleId: Number(mesocycleId),
                weeknumber: Number(weeknumber),
                daynumber: Number(daynumber),
                setNumber: targetSet.setNumber,
                exerciseId: exercise.exerciseId,
                selectedWeight,
                targetRir: targetSet.rirTarget,
            })
            if (!response.ok) return

            const { reps } = await response.json()
            setSessiondata({
                ...sessionData,
                sessionexercise: sessionData.sessionexercise.map((element: any) =>
                    element.set.some((eachset: any) => eachset.id === setId)
                        ? {
                            ...element,
                            set: element.set.map((eachset: any) =>
                                eachset.id === setId ? { ...eachset, reps: reps ?? null } : eachset
                            ),
                        }
                        : element
                ),
            })
        } catch {
            return //keep the old reps when the call fails
        }
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
    function deleteCurrentonly(exerciseId: number) {
        const filtered = sessionData.sessionexercise.filter(function (e: any) {
            return e.exerciseId !== exerciseId
        })
        setSessiondata({ ...sessionData, sessionexercise: filtered })
    }

    function promptDeleteExercise(exerciseId: number, exerciseName: string) {
        setDeletePrompt({ exerciseId, exerciseName })
    }

    function deleteForThisSession() {
        if (!deletePrompt) return
        deleteCurrentonly(deletePrompt.exerciseId)
        setDeletePrompt(null)
    }

    const deleteMutation = useMutation({
        mutationFn: async ({ exerciseId }: { exerciseId: number }) => {
            const response = await Post("/training/delete", {
                exerciseId: Number(exerciseId),
                mesocycleId: Number(mesocycleId),
                weeknumber: Number(weeknumber),
                daynumber: Number(daynumber),
            })
            if (!response.ok) {
                throw new Error("Failed to delete exercise")
            }
            const result = await response.json()
            return result
        },
        onSuccess: (result, variables) => {
            deleteCurrentonly(variables.exerciseId)
            setDeletePrompt(null)
            data?.sessions?.forEach((session: any) => {
                const laterSameWeek = session.weeknumber === Number(weeknumber) && session.daynumber > Number(daynumber)
                if (session.status === "pending" && (session.weeknumber > Number(weeknumber) || laterSameWeek)) {
                    localStorage.removeItem(`workout-${mesocycleId}-${session.weeknumber}-${session.daynumber}`)
                }
            })
            queryClient.invalidateQueries({ queryKey: ["allweeksdata"] })
            showPrompt(result?.message || "Exercise deleted for the remaining weeks")
        },
        onError: (error: any) => {
            showPrompt(error.message)
        }
    })

    function deleteTheRemainingWeek() {
        if (!deletePrompt) return
        deleteMutation.mutate({ exerciseId: deletePrompt.exerciseId })
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
    const mutation = useMutation({
        mutationFn: async ({oldId,newExercise}:{oldId:number,newExercise:any})=>{
            const response = await Post("/training/replace", {oldId, newId: newExercise.id,mesocycleId: Number(mesocycleId),weeknumber: Number(weeknumber), daynumber: Number(daynumber), })
            if (!response.ok) {
                throw new Error("error in replacing the exercise")
            }
                        
            
            const jsonresponse = await response.json()
            return jsonresponse
            
        
        },
        
        onSuccess:(result)=>{
            replaceForThisSession() 
            data?.sessions?.forEach((session: any) => {
                const laterSameWeek = session.weeknumber === Number(weeknumber) && session.daynumber > Number(daynumber)
                if (session.status === "pending" && (session.weeknumber > Number(weeknumber) || laterSameWeek)) {
                    localStorage.removeItem(`workout-${mesocycleId}-${session.weeknumber}-${session.daynumber}`)
                }
            })
            queryClient.invalidateQueries({ queryKey: ["allweeksdata"] })  //invalidate the key so that all the weeks data can be refetch again
             showPrompt(result?.message || "Exercise replaced for the remaining weeks")
        },
        onError:(error)=>{
            showPrompt(error.message)
        }
    })
    
    async function replaceTheRemainingWeek() {
        if (!replacePrompt) return
        const { oldId, newExercise } = replacePrompt
        mutation.mutate({oldId,newExercise }) //calling the mutation
 
    }

    const addExerciseMutation = useMutation({
        mutationFn: async ({
            exerciseId,
            sessionId,
            rirTarget,
            weeknumber: weekNum,
            daynumber: dayNum,
            mesocycleId: mesoId
        }: {
            exerciseId: number;
            sessionId: number;
            rirTarget?: number;
            weeknumber?: number;
            daynumber?: number;
            mesocycleId?: number;
        }) => {
            const response = await Post("/training/addexercise", {
                exerciseId: Number(exerciseId),
                sessionId: Number(sessionId),
                rirTarget: rirTarget != null ? Number(rirTarget) : undefined,
                mesocycleId: Number(mesoId ?? mesocycleId),
                weeknumber: Number(weekNum ?? weeknumber),
                daynumber: Number(dayNum ?? daynumber)
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                throw new Error(err.message || "Failed to add exercise")
            }
            return await response.json()
        },
        onSuccess: async (result) => {
            localStorage.removeItem(storageKey)
            data?.sessions?.forEach((session: any) => {
                if (session.weeknumber > Number(weeknumber) && session.daynumber === Number(daynumber)) {
                    localStorage.removeItem(`workout-${mesocycleId}-${session.weeknumber}-${session.daynumber}`)
                }
            })
            await queryClient.invalidateQueries({ queryKey: ["allweeksdata"] })
            setOpenorClose(false)
            showPrompt(result?.message || "Exercise added successfully")
        },
        onError: (error: any) => {
            showPrompt(error.message)
        }
    })

    function handleAddExercise(
        exerciseId: number,
        sessionId: number,
        rirTarget?: number,
        weekNum?: number,
        dayNum?: number,
        mesoId?: number
    ) {
        addExerciseMutation.mutate({
            exerciseId,
            sessionId,
            rirTarget,
            mesocycleId: mesoId ?? Number(mesocycleId),
            weeknumber: weekNum ?? Number(weeknumber),
            daynumber: dayNum ?? Number(daynumber)
        })
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
                await queryClient.invalidateQueries({ queryKey: ["allweeksdata"] })
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


    


   
   

    

    const currentSession = data?.sessions?.find( //get the current session
        (element: any) => element.weeknumber == weeknumber && element.daynumber == daynumber
    )

    const sessionRirTarget = (() => {
        for (const se of (sessionData?.sessionexercise ?? [])) {
            for (const s of (se.set ?? [])) {
                if (s.rirTarget != null) return Number(s.rirTarget)
            }
        }
        for (const se of (currentSession?.sessionexercise ?? [])) {
            for (const s of (se.set ?? [])) {
                if (s.rirTarget != null) return Number(s.rirTarget)
            }
        }
        return undefined
    })()

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



    if (isError) {
        return <ErrorState message={error.message} onRetry={() => refetch()} />
    }

    if ( isPending || (sessionData == undefined)) {
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
                    openSummary={() => {
                        setOpen(false)
                        setSummaryOpen(true)
                    }}
                />
                {Number(weeknumber) > 1 && (
                    <div className="mt-5 rounded-md border border-[#1f1f1f] border-l-2 border-l-red-600/70 bg-[#0a0a0a] px-4 py-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-500">
                            Auto-regulation
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-[1.65] text-[#8a8a8a]">{prompt}</p>
                    </div>
                )}
                <div className="mt-6 flex flex-col gap-3">
                    {sessionData.sessionexercise.map((exerciseobject: any, index: number) => (
                        <Setcard key={exerciseobject.id} exerciseData={exerciseobject} updateSet={updateSet} recalculateReps={recalculateReps} competeSet={competeSet} deleteSet={deleteSet} addSet={addSet} replaceExercise={replaceExercise} deleteWholeExercise={promptDeleteExercise} isSessionCompleted={isSessionCompleted} />
                    ))}
                    <button
                        type="button"
                        onClick={() => setOpenorClose(true)}
                        disabled={isSessionCompleted}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-[#262626] bg-[#0a0a0a]/50 text-sm font-medium text-[#8a8a8a] hover:text-[#ededed] hover:border-[#404040] hover:bg-[#111111] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#8a8a8a] disabled:hover:border-[#262626] disabled:hover:bg-[#0a0a0a]/50"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Exercise</span>
                    </button>
                </div>

                <div className="mt-8">
                    <button
                        type="button"
                        disabled={isCompleting || isSessionCompleted}
                        className={`group flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-[15px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000] ${
                            isSessionCompleted
                                ? "bg-[#111111] text-[#7f8c7f] cursor-not-allowed"
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
                                <Check className="h-5 w-5 text-green-600/70 stroke-[2.5]" />
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

            {isSummaryOpen && (
                <SummaryModal
                    mesocycleId={String(mesocycleId)}
                    onClose={() => setSummaryOpen(false)}
                />
            )}

            

            {replacePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !mutation.isPending && setReplacePrompt(null)}>
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
                                disabled={mutation.isPending}
                                onClick={replaceTheRemainingWeek}
                                className={`w-full flex items-center justify-center gap-2 rounded-lg border border-[#222222] py-2.5 text-sm font-semibold text-[#ededed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60 ${
                                    mutation.isPending
                                        ? "opacity-60 cursor-not-allowed bg-[#141414]"
                                        : "hover:border-[#333333] hover:bg-[#141414]"
                                }`}
                            >
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Replacing...</span>
                                    </>
                                ) : (
                                    "Remaining week"
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={mutation.isPending}
                                onClick={replaceForThisSession}
                                className={`w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed] ${
                                    mutation.isPending
                                        ? "opacity-60 cursor-not-allowed"
                                        : "hover:bg-red-500"
                                }`}
                            >
                                Just this session
                            </button>
                            <button
                                type="button"
                                disabled={mutation.isPending}
                                onClick={() => !mutation.isPending && setReplacePrompt(null)}
                                className={`w-full rounded-lg py-2.5 text-sm font-semibold text-[#8a8a8a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60 ${
                                    mutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:text-[#ededed]"
                                }`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deletePrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !deleteMutation.isPending && setDeletePrompt(null)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-scope-title"
                        className="relative w-full max-w-sm rounded-2xl border border-[#222222] bg-[#0a0a0a] p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="delete-scope-title" className="text-base font-semibold text-[#ededed]">Delete exercise?</h2>
                        <p className="mt-1 text-sm text-[#8a8a8a]">
                            Delete <span className="text-[#ededed]">{deletePrompt.exerciseName}</span> from the remaining weeks or just this session?
                        </p>
                        <div className="mt-5 flex flex-col gap-2">
                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={deleteTheRemainingWeek}
                                className={`w-full flex items-center justify-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 py-2.5 text-sm font-semibold text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60 ${
                                    deleteMutation.isPending
                                        ? "opacity-60 cursor-not-allowed"
                                        : "hover:border-red-800 hover:bg-red-950/40"
                                }`}
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    "Remaining weeks"
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={deleteForThisSession}
                                className={`w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed] ${
                                    deleteMutation.isPending
                                        ? "opacity-60 cursor-not-allowed"
                                        : "hover:bg-red-500"
                                }`}
                            >
                                Just this session
                            </button>
                            <button
                                type="button"
                                disabled={deleteMutation.isPending}
                                onClick={() => !deleteMutation.isPending && setDeletePrompt(null)}
                                className={`w-full rounded-lg py-2.5 text-sm font-semibold text-[#8a8a8a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/60 ${
                                    deleteMutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:text-[#ededed]"
                                }`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {
                isAddexerciseOpen && (
                    <AddExercise
                        setOpenorClose={setOpenorClose}
                        onClose={() => setOpenorClose(false)}
                        sessionId={currentSession?.id || sessionData?.id}
                        rirTarget={sessionRirTarget}
                        mesocycleId={Number(mesocycleId)}
                        weeknumber={Number(weeknumber)}
                        daynumber={Number(daynumber)}
                        onAddExercise={handleAddExercise}
                        isLoading={addExerciseMutation.isPending}
                    />
                )
            }

            <ToastDialog message={promptMessage} />
        </div>
    )
}
