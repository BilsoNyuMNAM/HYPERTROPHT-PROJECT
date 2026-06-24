import { useState, useEffect } from "react"
import {
    deleteExerciseFromExercises,
    deleteSetFromExercises,
    getPersistableExercises,
    type SessionExerciseDraft,
} from "./sessionDraft"
import {
    buildSessionWeeklySetSummary,
    type SessionWeeklySetSummarySeed,
} from "./sessionWeeklySummary"
import { Get, Post } from "../service/centralisedApi.js"

type PerformanceData = {
    score: number
    label: string
}

export function useSession({sessionId, weekId, mesoId}:{sessionId:string, weekId:string, mesoId:string}){
    const [isLoading, setIsLoading] = useState(true)
    const [sessionName, setSessionName] = useState("")
    const [addexercise, setAddexercise] = useState<SessionExerciseDraft[]>([])
    const [weeklySetSummarySeed, setWeeklySetSummarySeed] = useState<SessionWeeklySetSummarySeed[]>([])
    const [apiCall, setApiCall] = useState(new Set());
        const MUSCLE_COLORS = {
        "legs": "#4ade80", "glutes": "#4ade80",
        "calves": "#4ade80", "abductors": "#4ade80", "chest": "#60a5fa",
        "traps": "#a78bfa", "rear delts": "#a78bfa", "front delts": "#a78bfa","side delts": "#f59e0b", "biceps": "#f59e0b", "triceps": "#f87171","forearms": "#f87171", "abs": "#f87171"};
    useEffect(()=>{
        getSessionname()
    },[])

    async function getSessionname(){
        setIsLoading(true)
        try {
            const res = await Get(`/mesoCycle/session/${sessionId}`)
            if (!res.ok) {
                throw new Error(`Failed to fetch session: ${res.status}`)
            }
            const data = await res.json()
            setSessionName(data.session_name)
            setWeeklySetSummarySeed(data.weeklySetSummarySeed ?? [])
            const result: SessionExerciseDraft[] = data.eachexercise.map((exercise: any, index: number)=>{
                
                return {
                    ...exercise, 
                    id: index+1, 
                    set: exercise.set.map((set: any, index: number)=>
                    {
                        return{
                            ...set, id: index+1
                        }
                    }),
                    // Preserve soreness and performance feedback from backend
                    ...(exercise.soreness && {
                        soreness: exercise.soreness,
                        performance: exercise.performance ?? null
                    }),
                    ...(!exercise.soreness && exercise.performance && { performance: exercise.performance })
                }
            })
            setAddexercise(result)
        } finally {
            setIsLoading(false)
        }
    }

    function Addexercise(){
        setAddexercise((currentExercises) => [
            ...currentExercises,
            {
                id: currentExercises.length + 1,
                exercise_name: "",
                muscletrained: "",
                set: []
            }
        ])
    }

    async function Selecttrainedmuscle(id?:number, musclename?:string){
        if (!musclename) {
            const newaddexercise = addexercise.map((exercise: any) => {
                if (exercise.id === id) {
                    const { soreness, performance, ...rest } = exercise as any;
                    return { ...rest, muscletrained: "" };
                }
                return exercise;
            });
            setAddexercise(newaddexercise);
            return;
        }

        const isMultiple = addexercise.some((ex) => ex.id !== id && ex.muscletrained === musclename);

        let showFeedback = false;
        if (!isMultiple) {
            try {
                const result = await Get(`/mesoCycle/frequency/muscle?muscleName=${encodeURIComponent(musclename)}&weekId=${weekId}&mesoId=${mesoId}`);
                if (!result.ok) {
                    throw new Error(`Failed to fetch frequency muscle: ${result.status}`)
                }
                const data = await result.json();
                showFeedback = data.showSorenessFeedback;
            } catch (e) {
                console.error(e);
            }
        }

        const newaddexercise = addexercise.map((exercise: any) => {
            if (exercise.id === id) {
                if (showFeedback) {
                    return { ...exercise, muscletrained: musclename, soreness: null, performance: null };
                } else {
                    const { soreness, performance, ...rest } = exercise as any;
                    return { ...rest, muscletrained: musclename };
                }
            }
            return exercise;
        });
        setAddexercise(newaddexercise);
    }

    async function submitSession(){
        const persistableExercises = getPersistableExercises(addexercise)
        const result = await Post(`/mesoCycle/session/add/set/${sessionId}`, {
            sessionData:persistableExercises
        })

        if (!result.ok) {
            throw new Error(`Failed to save session: ${result.status}`)
        }

        return result.json()
    }


    function exerciseName(e:any, id?:number){
        const {name, value} = e.target
        
        const result = addexercise.map(exercise => {
            if(exercise.id === id){
                return{
                    ...exercise, [name]: value
                }
             }
             return exercise

        }   
        )

        setAddexercise(result)
    }
    
    
    function addsetData(e: any, exerciseid: number, id:number) {
        const { name, value } = e.target;
        
        const result = addexercise.map(exercise => //{"id", "exercisename", "sets":[{}, {}, {}]}
            exercise.id === exerciseid //How to do you access the keys of an object ??
            ? {
                ...exercise,   //expand the exercise object 
                set: exercise.set.map(set =>  //How do you go through an array of object ?? here ===> set = {"id", "reps", "weight", "rir"}
                    set.id === id ? { ...set, [name]: value } : set
                )
                }
            : exercise
        );
        setAddexercise(result);
    
    }

    function addSet(exerciseid: number) {
        const exerciseId = Number(exerciseid)
        setAddexercise(addexercise.map(exercise => { //{"id", "exercisename", "sets":[{}, {}, {}]}
            if (exercise.id === exerciseId) {
                return {
                    ...exercise,
                    // to create a copy we use "..." so if sets = [{}, {}, {}] then copy = ...sets
                    //since we are adding a new objec that means it will start with "{}"
                    set: [...exercise.set, { //How to you add new object to an array of object according to react ?
                        id: exercise.set.length + 1,
                        reps: "",
                        weight: "",
                        rir: ""
                    }]
                }
            }
        return exercise
    }))
    }
    


    function logSoreness(id: number, sorenessData: any) {
        setAddexercise((prevExercises) => prevExercises.map((exercise: any) => {
            if (exercise.id === id) {
                return { ...exercise, soreness: { soreness_score: sorenessData.level, description: sorenessData.label } };
            }
            return exercise;
        }));
    }

    function logPerformanceByMuscle(muscleName: string, performanceData: PerformanceData) {
        setAddexercise((prevExercises) => prevExercises.map((exercise: any) => {
            if (
                exercise.muscletrained !== muscleName ||
                !Object.prototype.hasOwnProperty.call(exercise, "soreness")
            ) {
                return exercise;
            }

            return {
                ...exercise,
                performance: {
                    score: performanceData.score,
                    level: performanceData.label
                }
            };
        }));
    }

    function deleteSet(exerciseId: number, setId: number) {
        setAddexercise((currentExercises) =>
            deleteSetFromExercises(currentExercises, exerciseId, setId)
        )
    }

    function deleteExercise(exerciseId: number) {
        setAddexercise((currentExercises) =>
            deleteExerciseFromExercises(currentExercises, exerciseId)
        )
    }

    const persistableExercises = getPersistableExercises(addexercise)
    const weeklySetSummary = buildSessionWeeklySetSummary(
        weeklySetSummarySeed,
        addexercise
    )

    return {isLoading, MUSCLE_COLORS, Addexercise,submitSession,  Selecttrainedmuscle, exerciseName, addsetData, addSet, deleteSet, deleteExercise, sessionName, addexercise, persistableExercises, apiCall, setApiCall, logSoreness, logPerformanceByMuscle, refreshSessionData:getSessionname, weeklySetSummary}
    

}
