import { useNavigate, useParams,useSearchParams } from "react-router-dom"
import { useState} from "react"
import Sessioncard from "../components/Sessioncard"
import { useQuery } from "@tanstack/react-query"
import { Get, Post, Delete } from "../service/centralisedApi.js"
import { Spinner } from "../components/ui/spinner"
type SessionListItem = {
    id: number
    session_name: string
}

function Createsessionpage({weekId, setDisplaySession, refetch}:{weekId:string, setDisplaySession:any, refetch:any}){
    const [searchParams] = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const mesoId = searchParams.get("mesoId")
    const [sessionName, setSessionName] = useState("");
    function handlechange(e:any){
        const {value} = e.target
        setSessionName(value)
    }
    async function Submit(){
        setIsLoading(true)
       try{
            const res = await Post(`/mesoCycle/session/create/${weekId}?sessionId=${mesoId}`, {
                session_name: sessionName
            })          
            if(res.status === 201){
                setDisplaySession(false)
                refetch();
             }
        
       }
       catch(error){
           console.error("Error creating session:", error)
       }
       finally{
        setIsLoading(false)
       }
        
       
       
    }
    return(
        <div className=" fixed z-10 h-screen w-full text-white bg-black   inset-0">
            <div className="p-3 h-screen w-full flex justify-center items-center mx-auto">
                <div className="w-full max-w-md flex flex-col items-center">
                    <div> 
                        <h1 className="text-5xl font-spaceMono">CREATE SESSION</h1>
                    </div>
                    <div className="mt-2 mb-10"> 
                            <p className="text-gray-400">Name you session to get started</p>
                    </div>
                    <div className="w-full px-20 mb-10">
                        <input type="text" onChange={(e)=>{handlechange(e)}} name="session" value={sessionName} placeholder="Session name" className="border rounded-lg p-2 w-full"/>
                    </div>
                    <div className="w-full">
                        <button onClick={Submit} className="cursor-pointer bg-white text-black tracking-wide w-full flex items-center justify-center  px-10 py-3 border font-thin rounded-lg" disabled={isLoading}> {isLoading?<div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin "/>:"CREATE SESSION"}</button>
                    </div>
            </div>  
            </div>
        </div>
    )
}


export default function Weekpage(){
    const navigate = useNavigate()
    const {weekId} = useParams()
    // const [isLoading, setIsLoading] = useState(false)
    const [displaySession, setDisplaySession] = useState(false)
    const [weekStatus, setWeekStatus] = useState<{
        unlocked: boolean
        nextWeekUnlocked: boolean
        isFinalWeek: boolean
    } | null>(null)
    const [loadError, setLoadError] = useState("")
    

    const [searchParams] = useSearchParams()
    const mesoId = searchParams.get("mesoId") || ""
    const {data, refetch, isLoading} = useQuery({
        queryKey: ["sessions", weekId],
        queryFn: async function(){
            const response = await Get(`/mesoCycle/session/all/${weekId}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch sessions: ${response.status}`)
            }
            return await response.json()
        }
    })

    const sessionDisplay = data?.result.sessions.length == 0?<p>No session to display </p>: data?.result.sessions.map((session, index)=>{
        return(
            <Sessioncard
                key={session.id}
                id={session.id}
                sessionName={session.session_name}
                number={index+1}
                weekId={weekId || ""}
                mesoId={mesoId}
                onDeleteSession={deleteSession}
                
                isLoading={isLoading}
            />
        )
    })

    async function deleteSession(sessionId: number, currentSessionName: string) {
        // setIsLoading(true)
        const deleteConfirmed = window.confirm(
            `Delete ${currentSessionName}? This removes the session from the current week.`
        ) 
        if (!deleteConfirmed) {
            // setIsLoading(false)
            return
        } 
        try{
            const response = await Delete(`/mesoCycle/session/${sessionId}`)
            const data = await response.json()
            if (!response.ok) {
            setLoadError(data.message || "Unable to delete session")
            return
        }
        }
        catch(error){
            console.error("Error deleting session:", error)
            setLoadError("An error occurred while deleting the session")
            return
        }
        finally{
            // setIsLoading(false)
            refetch();
        }
        

        
    }

    
    return(
        <div className="h-screen w-full bg-black text-white overflow-y-auto">
            <div className="w-full h-screen max-w-5xl mx-auto mt-7 ">
                <div className="px-8 py-6">
                    <div className={`${displaySession?"fixed":""}  z-20 mb-10 `}>
                        <button onClick={()=>{navigate(-1)}}className="cursor-pointer font-spaceMono">← Back to Week</button>
                    </div>
                    {displaySession? <Createsessionpage weekId={weekId || ""} setDisplaySession={setDisplaySession} refetch={refetch}/>:
                    <div>
                        <div>
                            <div>
                                <span className="font-spaceMono text-sm">WEEK 1</span>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-10 pr-4">
                                    <h1 className="text-4xl font-spaceMono font-bold">SESSION PLAN</h1>
                                    <div className="flex gap-2 items-center border rounded-lg px-4 py-2 text-xs font-spaceMono text-gray-300">
                                        {weekStatus?.isFinalWeek
                                            ? "FINAL WEEK"
                                            : weekStatus?.nextWeekUnlocked
                                                ? "NEXT WEEK UNLOCKED"
                                                : "NEXT WEEK LOCKED"}
                                    </div>
                                    
                                </div>
                                {loadError ? (
                                    <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                                        {loadError}
                                    </div>
                                ) : null}
                                {
                                    isLoading? <div className=" bg-black text-white flex items-center justify-center">
                                    <Spinner className="w-8 h-8 text-[#c8ff00]" /></div>
                    :(<div>
                        <div className="p-4">
                            <div className="mb-10">
                             {sessionDisplay}
                            </div>
                             <div className="flex align-center justify-center ">
                                <button className="cursor-pointer font-spaceMono" onClick={() => setDisplaySession(true)}>+ Add Session</button>
                            </div>
                             </div>
                              </div>)
                                }
                        </div>
                        </div>
                        <div></div>
                    </div>}
                    </div>
            </div>
        </div>
    )
}
