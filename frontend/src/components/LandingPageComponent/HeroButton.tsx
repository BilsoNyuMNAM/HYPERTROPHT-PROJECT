export default function HeroButton(){
    return(
        <div className="mt-10 flex flex-col gap-3">
            <div className="flex gap-3 flex-wrap">
                <a href="/signup">
                    <button
                        className="font-dmSans text-sm px-6 py-3 rounded-lg transition-all duration-200"
                        style={{ background: "#F5F5F5", color: "#111111", fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#D0D0D0")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#F5F5F5")}
                    >
                        Start for free
                    </button>
                </a>
                <button
                    className="font-dmSans text-sm px-6 py-3 rounded-lg transition-all duration-200"
                    style={{ color: "#888888", border: "1px solid #2A2A2A", background: "transparent" }}
                    onClick={() => document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" })}
                    onMouseEnter={e => (e.currentTarget.style.color = "#F5F5F5")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#888888")}
                >
                    See how it works →
                </button>
            </div>
            <div>
                <span
                    className="font-dmSans text-xs px-3 py-2 rounded-md inline-block"
                    style={{ color: "#888888", border: "1px solid #2A2A2A", background: "#1A1A1A" }}
                >
                    Built on adaptive volume science
                </span>
            </div>
        </div>
    )
}