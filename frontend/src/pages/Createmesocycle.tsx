import Volumecard from "../components/Volumecard"
import { useState } from "react"
import Frequencycard from "../components/Frequencycard"
import { useNavigate } from "react-router-dom";
import {Post} from "../service/centralisedApi.js"
function Volume({ volume, setVolume }: { volume: any, setVolume: any }) {
    const musclename: string[] = ["back","chest","legs","biceps","triceps","hamstrings","abs","front delts","side delts","rear delts","glutes","calves",];
    return (
        <>
            <div className="p-6">
                <div>
                    <h1 className="text-2xl font-bold ">Starting Volume</h1>
                    <p className="text-gray-400">Sets per week. Recommended: 6-12 per weeks per muscle </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">        
                    <Volumecard muscleGroup={musclename} volume={volume} setVolume={setVolume}/>
                </div>
            </div>
        </>
    )
}

function Frequency({ frequency, setFrequency }: { frequency: any, setFrequency: any }) {
    return (
        <div>
            <div>
                <h1 className="text-2xl font-bold ">Training Frequency</h1>
                <p className="text-gray-400">How many times per week will you train each muscle</p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto px-4">
                <Frequencycard frequency={frequency} setFrequency={setFrequency}/>
            </div>
        </div>
    )
}


function MesocycleOverview({ mesocycleName, setMesocycleName,numberOfweeks,setnumberOfweeks }: { mesocycleName: string, setMesocycleName: any, numberOfweeks:number, setnumberOfweeks:  React.Dispatch<React.SetStateAction<number>> }) {
    
    return (
        <div>
            <div className="p-6">
                <div>
                    <div className="pb-4">
                        <h1 className="text-2xl font-bold pb-2.5"> Name of your Mesocycle</h1>
                        <p className="text-gray-400">Give this training block a name </p>
                    </div>
                    <div>
                        <label>Mesocycle Name</label>
                        <br></br>
                        <input 
                            type="text" 
                            value={mesocycleName} 
                            onChange={(e) => setMesocycleName(e.target.value)}
                            className="rounded-md w-full h-8 px-3 py-2 border bg-secondary/50" 
                            placeholder="bulk1"
                        />
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div>
                    <h1>Number of Weeks</h1>
                    <p>How many progressive weeks should this mesocycle last ?</p>
                </div>
                <div className="flex  gap-4  items-center mt-4">
                    <div>
                        <button disabled={numberOfweeks === 4 } onClick={()=>{setnumberOfweeks(prev=>prev-1)}} className={`w-10 h-10 rounded-full border" ${numberOfweeks === 4 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>-</button>
                    </div>
                    <div>{numberOfweeks} weeks</div>
                    <div><button onClick={()=>{setnumberOfweeks(prev=>Math.min(12, prev+1))}} className={`w-10 h-10 rounded-full border ${numberOfweeks === 12 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>+</button></div>

                </div>
            </div>
        </div>
    )
}

export default function CreateMesocycle() {
    const [currentStep, setCurrentStep] = useState(1)
    const navigate = useNavigate();
    const [isLoading, setisLoading] = useState(false)
    const [mesocycleName, setMesocycleName] = useState("")
    const isDisabled = !mesocycleName;
    const [numberOfweeks, setnumberOfweeks] = useState(4);
    const [volume, setVolume] = useState({
        "back": 8, "chest": 8,  "biceps": 8, "triceps": 8,
         "abs": 8, "front delts": 8, "side delts": 8,
        "rear delts": 8, "legs": 8,"glutes": 8, "calves": 8, "hamstrings": 8
    })
    const [frequency, setFrequency] = useState([
        {"back": 2},{"biceps": 2}, {"chest": 2}, {"triceps": 2},{"front delts": 2}, {"side delts": 2},
        {"rear delts": 2}, {"legs": 2},  {"abs": 2}, {"glutes": 2}, {"calves": 2}, {"hamstrings": 2}
    ])

   async function handleSubmit(){
        setisLoading(true);
         const volumeArray = Object.entries(volume).map(([muscle, sets]) => ({ muscle_name: muscle, set: sets }))

        const frequencyArray = frequency.map((f) => {
                 const [muscle, timesPerWeek] = Object.entries(f)[0]
                 return { muscle_name: muscle, timesPerWeek }
             })
        const payload = { name: mesocycleName, volume: volumeArray, frequencies: frequencyArray, numberOfweeks:numberOfweeks }
        try{
            const response = await Post("/mesoCycle/create", payload)           
            if(response.status === 401){
                window.alert("Unauthorized. Please log in again.")
                navigate("/signup");
                return;
            }
            if(!response.ok){
                window.alert("Failed to create mesocycle. Please try again.");
                return;
            }
             navigate("/Allmesocycle")

        }
        catch(error){
            window.alert("Failed to create mesocycle. Please try again.");
        }
        finally{
            setisLoading(false);
        }
        
   }


    return (
        <div className="w-full h-screen bg-black text-white">
            <div className="p-4 w-full h-screen flex flex-col items-center justify-center">
                <div className="border-2 border-black w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-7">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">1</div>
                            <span>Overview</span>
                            <div className="w-12 h-px bg-white"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-white text-black" : ""} flex items-center justify-center`}>2</div>
                            <span>Volume</span>
                            <div className="w-12 h-px bg-white"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${currentStep >= 3 ? "bg-white text-black" : ""} flex items-center justify-center`}>3</div>
                            <span>Frequency</span>
                        </div>
                    </div>

                    {currentStep === 1 
                        ? <MesocycleOverview mesocycleName={mesocycleName} setMesocycleName={setMesocycleName} numberOfweeks={numberOfweeks} setnumberOfweeks={setnumberOfweeks}/> 
                        : currentStep === 2 
                        ? <Volume volume={volume} setVolume={setVolume}/> 
                        : <Frequency frequency={frequency} setFrequency={setFrequency}/>
                    }

                    <div className="flex justify-between px-3">
                        <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}>
                            <span className={`${currentStep <= 1 ? "text-gray-400 cursor-not-allowed" : ""}`}> Back </span>
                        </button>
                        {currentStep === 3 
                            ? <button className="bg-white text-black px-4 py-2 rounded-sm" onClick={handleSubmit} disabled={isLoading}> {isLoading?<div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin " />:"Create Mesocycle"}</button> 
                            : <button className={`px-4 py-2 rounded-sm bg-white text-black ${ isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                onClick={() => setCurrentStep((prev) => prev + 1)} disabled={isDisabled}> Next </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
