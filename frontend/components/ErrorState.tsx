interface ErrorStateProps {
    message: string
    onRetry?: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="min-h-screen w-full bg-[#000000] text-[#ededed] flex items-center justify-center px-4 sm:px-6">
            <div className="w-full max-w-sm rounded-2xl border border-[#222222] bg-[#0a0a0a] p-6 sm:p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#f97316]">
                    Something went wrong
                </span>
                <h1 className="mt-2 text-lg font-semibold tracking-tight text-[#ededed]">
                    Could not load this workout
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#8a8a8a]">{message}</p>

                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-6 w-full rounded-lg bg-[#e52525] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors duration-150 hover:bg-[#d01e1e] active:scale-[0.99] cursor-pointer"
                    >
                        Try again
                    </button>
                )}
            </div>
        </div>
    )
}
