import type { ReactNode } from "react"
import { CircleHelp, X } from "lucide-react"
import { muscleGroup } from "../pages/priorities"
import { useState } from "react"

interface FeedbackProps {
    muscleName: string
    onClose: () => void
    updateFeedback:any
    showSorenessSection:any
}

const optionClass = "min-h-[3.25rem] rounded-lg border border-[#7f1d1d] bg-[#261212] px-3 py-2.5 text-sm font-medium leading-snug text-[#ededed] transition-colors hover:border-red-500 hover:bg-[#341717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"

function Question({ title, prompt, children }: { title: string; prompt: string; children: ReactNode }) {
    return (
        <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#ededed]">
                {title}
                <CircleHelp size={16} strokeWidth={1.75} className="text-[#5a5a5a]" aria-hidden="true" />
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#8a8a8a]">{prompt}</p>
            <div className="mt-3">{children}</div>
        </section>
    )
}

export default function Feedback({ muscleName, onClose,updateFeedback,showSorenessSection }: FeedbackProps) {
    const muscle = muscleName.toLowerCase()
    const muscleId = muscleGroup[muscleName as keyof typeof muscleGroup] //get muscleId fron muscleGroup object
    const [musclefeedback, setMusclefeedback]= useState({
        muscleId:muscleId,
        soreness: showSorenessSection ? 0 : -1, // -1 = first time training this muscle, nothing to rate
        pump:0,
        workload:0 
    })

    function updateValue(name: string, value: number){
        setMusclefeedback((current)=>({
            ...current,
            [name]:value
        }))
    }
        

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-title"
                className="flex max-h-[92dvh] w-full max-w-[36rem] flex-col overflow-hidden rounded-t-2xl border border-[#222222] bg-[#141414] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] sm:rounded-2xl"
            >
                <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
                    <h1 id="feedback-title" className="text-[1.75rem] font-semibold tracking-tight text-[#ededed]">
                        Feedback
                    </h1>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close feedback"
                        className="-mr-1 rounded-full p-2 text-[#8a8a8a] transition-colors hover:bg-[#1f1f1f] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
                    >
                        <X size={22} strokeWidth={2} />
                    </button>
                </header>

                <div className="flex flex-col gap-7 overflow-y-auto px-5 py-5 sm:px-6">
                    {showSorenessSection && (
                    <Question
                        title={`${muscleName} soreness`}
                        prompt={`How sore did you get in your ${muscle} AFTER training it LAST TIME?`}
                    >
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {["Never got sore", "Healed a while ago", "Healed just on time", "I'm still sore!"].map((label,index) => (
                                <button key={index+1} type="button" name="soreness" aria-pressed={musclefeedback.soreness === index} className={`${optionClass} ${musclefeedback.soreness === index ? "border-red-500 bg-[#341717]" : ""}`} onClick={()=>{updateValue("soreness", index)}}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Question>
                    )}

                    <Question
                        title={`${muscleName} pump`}
                        prompt={`How much of a pump did you get today in your ${muscle}?`}
                    >
                        <div className="grid grid-cols-3 gap-2">
                            {["Low pump", "Moderate pump", "Amazing pump"].map((label,index) => (
                                <button key={index+1} type="button" name="pump" aria-pressed={musclefeedback.pump === index} className={`${optionClass} ${musclefeedback.pump === index ? "border-red-500 bg-[#341717]" : ""}`} onClick={()=>{updateValue("pump", index)}}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Question>

                    <Question
                        title={`${muscleName} volume`}
                        prompt={`How was the volume of work (number of hard sets) for your ${muscle}?`}
                    >
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {["Not enough", "Just right", "Pushed my limits", "Too much"].map((label,index) => (
                                <button key={index+1} type="button" name="workload" aria-pressed={musclefeedback.workload === index} className={`${optionClass} ${musclefeedback.workload === index ? "border-red-500 bg-[#341717]" : ""}`} onClick={()=>{updateValue("workload", index)}}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Question>
                </div>

                <footer className="flex items-center justify-end gap-2 border-t border-[#222222] px-5 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#ededed] transition-colors hover:bg-[#1f1f1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
                        onClick={()=>{updateFeedback(musclefeedback); onClose()}}
                    >
                        Save
                    </button>   
                </footer>
            </div>
        </div>
    )
}
