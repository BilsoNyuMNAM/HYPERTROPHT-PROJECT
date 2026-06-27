export default function HeroText(){
    return(
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
                <span className="font-spaceMono text-xs px-2 py-1 rounded" style={{ color: "#4CAF7D", background: "#4CAF7D1A", border: "1px solid #4CAF7D33" }}>
                    ADAPTIVE VOLUME
                </span>
            </div>
            <h1 className="text-6xl font-bold leading-tight font-bebas" style={{ color: "#F5F5F5" }}>
                Training <br/>volume that <br/>
                <span style={{ color: "#4CAF7D" }}> regulates</span> <br/>
                itself
            </h1>
            <p className="font-spaceMono text-sm leading-relaxed" style={{ color: "#888888" }}>
                Daily feedback tunes your weekly workload <br/>
                so progress stays high and fatigue stays low
            </p>
        </div>
    )
}