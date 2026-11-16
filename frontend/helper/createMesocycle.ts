import { Post } from "../src/service/centralisedApi.js"

export interface MesocycleDataToSend {
    mesocyclename?: string
    length?: number
    days: {
        label: string
        exercises: { exerciseId: number; muscleId: number }[]
    }[]
    priorities: Record<string, { muscleGroupId: number; priorityType: string }>
}
async function createMesocycleApi(
    dataTosend: MesocycleDataToSend,
    mesoformdata: { mesocyclename: string; weeks: number }
) {
    const payload = {
        ...dataTosend,
        mesocycleName: mesoformdata.mesocyclename.trim(),
        length: mesoformdata.weeks,
        
    }

    const response = await Post("/mesocycles/create", payload)
    return response
}

export default createMesocycleApi