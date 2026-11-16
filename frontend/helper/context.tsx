import { createContext, useState, type ReactNode } from "react";

export const noOfexerciseAndsessionContext = createContext<any>(null);

function ContextProvider({ children }: { children: ReactNode }) {
    const [calculated, setCalculated] = useState<any>(null);
    const [trainingDays, setTrainingDays] = useState<number>(4);
    const [mesoformdata, setmesoformdata] = useState<{ mesocyclename: string; weeks: number }>({
        mesocyclename: "",
        weeks: 4,
    })

    const [emphasisMuscle, setEmphasizemuscle] = useState<number[]>([])
    const [growMuscle, setGrowmuscle] = useState<number[]>([])
    const [maintainMuscle, setMaintainmuscle] = useState<number[]>([])
    const [allexercise, setAllexercise] = useState()
    // Persists exercise selections across back-navigation
    const [selectExercise, setSelectedExercise] = useState<Record<string, number>>({})

    return (
        <noOfexerciseAndsessionContext.Provider value={{ calculated, setCalculated, trainingDays, setTrainingDays, emphasisMuscle, setEmphasizemuscle, growMuscle, setGrowmuscle, maintainMuscle, setMaintainmuscle, mesoformdata, setmesoformdata, selectExercise, setSelectedExercise,setAllexercise,allexercise }}>
            {children}
        </noOfexerciseAndsessionContext.Provider>
    );
}

export default ContextProvider;
