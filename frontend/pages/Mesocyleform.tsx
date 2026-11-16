import { useContext, useEffect, useRef, useState } from "react"
import { noOfexerciseAndsessionContext } from "../helper/context"
import ToastDialog from "../components/ToastDialog"

interface MesocycleFormProps {
    setopen?: (value: boolean) => void
    onSubmit: () => Promise<void> | void
}

function MesocycleForm({ setopen, onSubmit }: MesocycleFormProps) {
    const { mesoformdata, setmesoformdata } = useContext(noOfexerciseAndsessionContext)
    const [promptMessage, setPromptMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
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

    function handleDataChange(name: string, value: string | number) {
        setmesoformdata((object) => ({
            ...object,
            [name]: value,
        }))
    }

    const label = [
        { name: "weeks", value: 4 },
        { name: "weeks", value: 5 },
        { name: "weeks", value: 6 },
        { name: "weeks", value: 7 },
        { name: "weeks", value: 8 },
    ]

    async function checking() {
        // Check if mesocycle name is empty or not
        if (!mesoformdata.mesocyclename || !mesoformdata.mesocyclename.trim()) {
            showPrompt("Please enter a mesocycle name first")
            return
        }

        try {
            setIsSubmitting(true)
            await onSubmit()
        } catch (error) {
            console.error("Error creating mesocycle:", error)
            showPrompt("Failed to create mesocycle. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-[#ededed]">
                <div className="flex flex-col gap-1 pb-4 border-b border-[#222222]">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#707070]">
                        Mesocycle Builder
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#ededed]">
                        CREATE YOUR MESOCYCLE
                    </h1>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#a1a1a1]">
                            Mesocycle name
                        </span>
                        <input
                            type="text"
                            name="mesocyclename"
                            placeholder="untitled mesocycle"
                            value={mesoformdata.mesocyclename}
                            onChange={(e) => {
                                handleDataChange(e.target.name, e.target.value)
                            }}
                            className="w-full px-4 py-3 bg-[#121212] border border-[#262626] rounded-xl text-sm text-[#ededed] placeholder:text-[#525252] focus:outline-none focus:border-[#e52525] focus:ring-1 focus:ring-[#e52525] transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-medium text-[#ededed]">
                            How many weeks will you train (including deload)?
                        </span>
                        <div className="grid grid-cols-5 gap-2">
                            {label.map((button, index) => {
                                const isSelected = mesoformdata.weeks === button.value

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        value={button.value}
                                        name={button.name}
                                        onClick={(e) => {
                                            handleDataChange(e.currentTarget.name, Number(e.currentTarget.value))
                                        }}
                                        className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-150 cursor-pointer ${
                                            isSelected
                                                ? "bg-[#e52525] border-[#e52525] text-white shadow-lg shadow-red-950/40 ring-1 ring-[#e52525]"
                                                : "bg-[#121212] border-[#222222] text-[#a1a1a1] hover:border-[#444444] hover:text-[#ededed] hover:bg-[#181818]"
                                        }`}
                                    >
                                        {button.value}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setopen?.(false)}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase text-[#a1a1a1] bg-[#141414] border border-[#262626] hover:bg-[#1f1f1f] hover:text-[#ededed] hover:border-[#383838] transition-all duration-150 cursor-pointer text-center"
                        >
                            CANCEL
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase text-white bg-[#e52525] hover:bg-[#d01e1e] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-950/40 transition-all duration-150 cursor-pointer text-center"
                            onClick={checking}
                        >
                            {isSubmitting ? "CREATING..." : "CREATE"}
                        </button>
                    </div>
                </div>
            </div>
            <ToastDialog message={promptMessage} />
        </div>
    )
}

export default MesocycleForm
