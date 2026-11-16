import { useState } from "react"

export default function useWorkoutDay() {
    const [sessionData, setSessiondata] = useState<any>(null)
    return { sessionData, setSessiondata }
}
