export default function Feedback(){
    const steps = [
        {
            num: "01",
            title: "Log Feedback",
            desc: "Rate soreness, performance, and readiness after each session. Takes under 20 seconds.",
        },
        {
            num: "02",
            title: "Model Adjusts Volume",
            desc: "Our algorithm weighs your feedback against training history to recalculate optimal sets per muscle.",
        },
        {
            num: "03",
            title: "Next Volume Adapts",
            desc: "Your updated plan is ready — more volume when you're thriving, less when you're not.",
        },
    ]

    return(
        <div>
            <p className="font-spaceMono text-xs mb-3" style={{ color: "#4CAF7D" }}>HOW IT WORKS</p>
            <h2 className="text-3xl font-bold font-spaceMono mb-2" style={{ color: "#F5F5F5" }}>
                Feedback regulates volume
            </h2>
            <p className="text-sm font-spaceMono mb-10" style={{ color: "#888888" }}>
                A three-step loop that continually adapts your training load<br/>
                based on how your body actually responds
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps.map((step, i) => (
                    <div key={i}>
                        <div
                            className="rounded-xl p-6 h-full flex flex-col gap-4 transition-all duration-200"
                            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                        >
                            <span className="font-bebas text-4xl" style={{ color: "#2A2A2A" }}>
                                {step.num}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: "#4CAF7D" }} />
                                <h3 className="font-dmSans font-semibold text-base" style={{ color: "#F5F5F5" }}>
                                    {step.title}
                                </h3>
                            </div>
                            <p className="font-spaceMono text-xs leading-relaxed" style={{ color: "#888888" }}>
                                {step.desc}
                            </p>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="hidden md:flex absolute" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}