import { AlertCircle } from "lucide-react"

interface ToastDialogProps {
    message: string | null
}

export default function ToastDialog({ message }: ToastDialogProps) {
    if (!message) return null

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[90%] sm:w-auto transition-all animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-[#141414]/95 border border-[#2b2b2b] text-[#ededed] rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-[#e52525] shrink-0" />
                <span className="text-sm font-medium tracking-wide">{message}</span>
            </div>
        </div>
    )
}
