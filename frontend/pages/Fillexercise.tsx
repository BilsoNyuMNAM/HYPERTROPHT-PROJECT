import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Plus } from "lucide-react"
import { noOfexerciseAndsessionContext } from "../helper/context"
import getDaysForMuscle, { getTrainingDays } from "../helper/getDaysForMuscle"
import { muscleGroup } from "./priorities"
import MesocycleForm from "./Mesocyleform"
import {transformExerciseresponseShape, buildPriorities, buildDays} from "../helper/transform"
import ToastDialog from "../components/ToastDialog"
import createMesocycleApi from "../helper/createMesocycle"
import Addmusclegroup from "./addmusclegroup"


const MAX_EXERCISES_PER_DAY = 9

const muscleNameById: Record<number, string> = Object.entries(muscleGroup).reduce(
    (acc, [name, id]) => {
        acc[id] = name
        return acc
    },
    {} as Record<number, string>
)

function distributeExercises(calculated: any, daysPerWeek: number) {
    const trainingDays = getTrainingDays(daysPerWeek)
    const schedule: Record<string, number[]> = {}
    
    for (const day of trainingDays) {
        schedule[day] = []
    }

    if (!calculated) {
        return schedule
    }

    const priorityCategories = Object.keys(calculated)

    for (const priority of priorityCategories) {
        const muscles = calculated[priority]

        for (const muscleId of Object.keys(muscles)) {
            const targetMuscle = muscles[muscleId]
            const targetDays = getDaysForMuscle(targetMuscle.sessionsCount, trainingDays, schedule, targetMuscle.exerciseCount)

            if (!targetDays || targetDays.length === 0) {
                continue
            }

            for (let slot = 0; slot < targetMuscle.exerciseCount; slot++) {
                const dayIndex = slot % targetDays.length
                const dayName = targetDays[dayIndex]

                if (!schedule[dayName]) {
                    schedule[dayName] = []
                }

                schedule[dayName].push(Number(muscleId))
            }
        }
    }

    return schedule
}

function ExercisePicker({ muscleName, exercises, selectedId, onSelect, onClose }: {
    muscleName: string
    exercises: {id:number, name:string, muscleGroupdId:number}[]
    selectedId: number | undefined
    onSelect: (id: number) => void
    onClose: () => void
}) {
    const [query, setQuery] = useState("")
    const filtered = exercises.filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase()))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
                className="relative bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md max-h-[75vh] flex flex-col overflow-hidden shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <h2 className="text-xl font-semibold text-neutral-100">Exercises</h2>
                    <button type="button" onClick={onClose} className="text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer">✕</button>
                </div>
                <div className="px-5 pb-4 border-b border-neutral-800">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-600"
                    />
                    <span className="inline-block mt-3 text-[10px] font-mono uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-full px-2.5 py-1">
                        {muscleName}
                    </span>
                </div>
                <div className="overflow-y-auto flex flex-col">
                    {filtered.length === 0 ? (
                        <span className="text-xs text-neutral-600 px-5 py-6">No exercises found</span>
                    ) : (
                        filtered.map((exercise) => (
                            <button
                                key={exercise.id}
                                type="button"
                                onClick={() => onSelect(exercise.id)}
                                className={`flex items-center gap-3 px-5 py-3.5 text-left border-b border-neutral-900 hover:bg-neutral-900 transition-colors cursor-pointer ${selectedId === exercise.id ? "bg-neutral-900" : ""}`}
                            >
                                <span className={`w-4 h-4 rounded-full border flex-shrink-0 ${selectedId === exercise.id ? "border-neutral-200 bg-neutral-200" : "border-neutral-700"}`} />
                                <span className="text-sm text-neutral-200 truncate">{exercise.name}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function AddExercise() {
    const navigate = useNavigate()
    const {  calculated, trainingDays, mesoformdata, emphasisMuscle,growMuscle,maintainMuscle, selectExercise, setSelectedExercise } = useContext(noOfexerciseAndsessionContext)
    const schedule = useMemo(() => distributeExercises(calculated, trainingDays), [calculated, trainingDays])

    const [fechExercises, setExercises]= useState<Record<number, {id:number,name:string ,muscleGroupdId:number}[]>>({})
    const array:{day:string, muscles:number[]}[]= []
    const [isFormopen, setopen] = useState<boolean>(false);

   

    const [promptMessage, setPromptMessage] = useState<string | null>(null);
    const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function showPrompt(msg: string) {
        if (promptTimerRef.current) {
            clearTimeout(promptTimerRef.current)
        }
        setPromptMessage(msg) //the message is passed to this function from whoevre this function was called 1. handleCreateMesocycleClick
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

    

    Object.keys(schedule).forEach(dayname=>{
        array.push({day:dayname, muscles:schedule[dayname]})
    })

    const [daysBeforeChange, setChangeDay] = useState(array)
    const [isOpen, setOpen] = useState<number | null>(null)
    const [dragSource, setDragSource] = useState<{outer: number, inner: number} | null>(null)
    const [picker, setPicker] = useState<{outer: number, inner: number, muscleId: number} | null>(null)


    //drag and drop feature
    function handleDrop(targetOuter: number, targetInner: number) {
        if (!dragSource) return
        const source = dragSource
        setDragSource(null)
        if (source.outer === targetOuter && source.inner === targetInner) return
        const keyMap: Record<string, string> = {}
        daysBeforeChange.forEach((day, o) => {
            const indices = day.muscles.map((_, i) => i)
            if (o === source.outer) indices.splice(source.inner, 1)
            if (o === targetOuter) indices.splice(targetInner, 0, o === source.outer ? source.inner : -1)
            indices.forEach((orig, pos) => {
                keyMap[`${o}-${pos}`] = orig === -1 ? `${source.outer}-${source.inner}` : `${o}-${orig}`
            })
        })
        const nextDays = daysBeforeChange.map((day, o) => ({ ...day, muscles: [...day.muscles] }))
        const [moved] = nextDays[source.outer].muscles.splice(source.inner, 1)
        nextDays[targetOuter].muscles.splice(targetInner, 0, moved)
        const nextSelection: Record<string, number> = {}
        for (const [newKey, oldKey] of Object.entries(keyMap)) {
            if (selectExercise[oldKey] !== undefined) nextSelection[newKey] = selectExercise[oldKey]
        }
        setChangeDay(nextDays)
        setSelectedExercise(nextSelection)
    }
    
     function OpenAddmuscle(index: number) {
        setOpen(index)
    }   

    function handleDayChange(index:number, value:string){
        const newArray = [...daysBeforeChange]
        newArray[index].day = value
        setChangeDay(newArray)
    }

    async function fetchAllexercise(){
        const response = await fetch("http://localhost:3000/api/training/exercises")
        const result = response.json()
        
        return result;
        
    }

    function addselectedExercise(objectIndex:number, arrayIndex:number, exerciseId){

        setSelectedExercise({...selectExercise,[`${objectIndex}-${arrayIndex}`]:exerciseId})
    }
    const dataTosend = {
       mesocyclename:mesoformdata.mesocyclename,
       length:mesoformdata.weeks,
        days:buildDays(daysBeforeChange, selectExercise),
        priorities:buildPriorities(emphasisMuscle,growMuscle,maintainMuscle)
    }

    useEffect(()=>{
        fetchAllexercise().then((result)=>{
             if (result?.exercises) {
            const transformed = transformExerciseresponseShape(result.exercises);
            
            setExercises(transformed);
        }

        })
       
    },[])

    function handleCreate(){
        let result = dataTosend.days.some((object, index)=>{      
           return  object.exercises.length !== daysBeforeChange[index].muscles.length //if the muscle length and the exercises length are not equal , that means some exercises are not selected
            
        })
        return result
    }

    function handleCreateMesocycleClick() {
        // Read from the rendered days so manual "Add Muscle Group" edits count too.
        const overloadedDays = daysBeforeChange
            .filter((eachArray) => eachArray.muscles.length > MAX_EXERCISES_PER_DAY)
            .map((eachArray) => eachArray.day)

        if (overloadedDays.length > 0) {
            showPrompt(`Too many exercises on ${overloadedDays.join(", ")}. Reduce priorities or add training days.`)
            return
        }

        const hasUnselectedExercises = handleCreate()
        if (hasUnselectedExercises) {
            showPrompt("Please select all the exercises first")
            return
        }
        setopen(true)
    }

    async function handleMesocycleSubmit() {
        const response = await createMesocycleApi(dataTosend, mesoformdata)
        if (!response?.ok) {
            console.error("Failed to create mesocycle, status:", response?.status)
            throw new Error("Failed to create mesocycle")
        }
        const data = await response.json()
        if (!data?.id) {
            throw new Error("Mesocycle was created without an id")
        }
        setopen(false)
        navigate(`/mesocycles/${data.id}/week/1/days/1`)
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 sm:p-10 font-sans">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#737373] hover:text-[#ededed] transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                            Mesocycle Builder
                        </span>
                        <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 mt-1">
                            Exercise Distribution
                        </h1>      
                    </div>
                    <div>
                        <button className="bg-[#d01e1e] hover:bg-[#b51919] transition-colors px-5 py-3 rounded-xl font-medium cursor-pointer" onClick={handleCreateMesocycleClick}>CREATE MESOCYCLE</button>
                    </div>
                </div>
                

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {daysBeforeChange.map((eachArray, outerindex) => (
                        <div  key={outerindex}
                            className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleDrop(outerindex, eachArray.muscles.length) }}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                                <select
                                    className="text-base font-semibold text-neutral-200 bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
                                    value={eachArray.day}
                                    onChange={(e) => handleDayChange(outerindex, e.target.value)}
                                >
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                </select>
                                <span
                                    className={`text-xs font-mono ${
                                        eachArray.muscles.length > MAX_EXERCISES_PER_DAY ? "text-[#e52525]" : "text-neutral-500"
                                    }`}
                                >
                                    {eachArray.muscles.length} slots
                                    {eachArray.muscles.length > MAX_EXERCISES_PER_DAY ? " · max 9" : ""}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {eachArray.muscles.length === 0 ? (
                                    <span className="text-xs text-neutral-600">Rest / Empty</span>
                                ) : (
                                    eachArray.muscles.map((muscleId, innerindex) => (
                                        <div
                                            key={innerindex}
                                            draggable
                                            onDragStart={() => setDragSource({outer: outerindex, inner: innerindex})}
                                            onDragEnd={() => setDragSource(null)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(outerindex, innerindex) }}
                                            className={`px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300 flex flex-col gap-2 h-20 justify-center cursor-grab ${dragSource?.outer === outerindex && dragSource?.inner === innerindex ? "opacity-40" : ""}`}
                                        >
                                            <span className="truncate">{muscleNameById[muscleId] || `Muscle ${muscleId}`}</span>

                                            <button
                                                type="button"
                                                onClick={() => setPicker({outer: outerindex, inner: innerindex, muscleId})}
                                                className="bg-neutral-900 border border-neutral-700 text-neutral-200 rounded px-2 py-1 text-sm w-full text-left truncate cursor-pointer hover:border-neutral-600 transition-colors"
                                            >
                                                {selectExercise[`${outerindex}-${innerindex}`] !== undefined
                                                    ? fechExercises[muscleId]?.find((e) => e.id === selectExercise[`${outerindex}-${innerindex}`])?.name ?? "Select an exercise"
                                                    : "Select an exercise"}
                                            </button>

                                        </div>
                                    ))
                                    
                                )
                                
                                }
                                <button
                                    type="button"
                                    onClick={() => OpenAddmuscle(outerindex)}
                                    className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-neutral-700 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-200 hover:border-neutral-500 transition-colors cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Muscle Group
                                </button>
                                
                            </div>
                             {
                                    isOpen === outerindex && (<Addmusclegroup setChangeDay={setChangeDay} daysBeforeChange={daysBeforeChange} propindex={outerindex} onClose={() => setOpen(null)} />)
                             }

                        </div>
                       
                    ))}
                        
                </div>
            </div>
            {
                isFormopen && <MesocycleForm setopen={setopen} onSubmit={handleMesocycleSubmit} />
            }
            {
                picker && (
                    <ExercisePicker
                        muscleName={muscleNameById[picker.muscleId] || `Muscle ${picker.muscleId}`}
                        exercises={fechExercises[picker.muscleId] ?? []}
                        selectedId={selectExercise[`${picker.outer}-${picker.inner}`]}
                        onSelect={(id) => {
                            addselectedExercise(picker.outer, picker.inner, id)
                            setPicker(null)
                        }}
                        onClose={() => setPicker(null)}
                    />
                )
            }
            <ToastDialog message={promptMessage} />
        </div>
    )
}

export default AddExercise
