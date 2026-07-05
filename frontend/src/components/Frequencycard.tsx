type Frequency = { [key: string]: number }

export default function Frequencycard({
    frequency,
    setFrequency,
}: {
    frequency: Frequency[]
    setFrequency: (value: React.SetStateAction<Frequency[]>) => void
}) {
    const frequencyOptions = [2, 3, 4, 5, 6]

    const handleSelect = (muscleName: string, option: number) => {
        setFrequency(prev =>
            prev.map(muscle =>
                Object.keys(muscle)[0] === muscleName ? { [muscleName]: option } : muscle
            )
        )
    }

    return (
        <>
            {frequency.map((muscle) => {
                const muscleName = Object.keys(muscle)[0]
                const selectedValue = muscle[muscleName]
                return (
                    <div
                        key={muscleName}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            borderBottom: "1px solid #1e1e1e",
                            transition: "background-color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#161616")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                        <span
                            style={{
                                fontSize: "13px",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: "#ffffff",
                            }}
                        >
                            {muscleName}
                        </span>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            {frequencyOptions.map((option) => {
                                const isSelected = selectedValue === option
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleSelect(muscleName, option)}
                                        style={{
                                            width: "30px",
                                            height: "30px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            transition: "background-color 0.15s, color 0.15s, border-color 0.15s",
                                            backgroundColor: isSelected ? "#ffffff" : "#1a1a1a",
                                            color: isSelected ? "#000000" : "#a1a1aa",
                                            border: isSelected ? "1px solid #ffffff" : "1px solid #2a2a2a",
                                            fontFamily: "inherit",
                                        }}
                                        onMouseEnter={e => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = "#3f3f46"
                                                e.currentTarget.style.color = "#ffffff"
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = "#2a2a2a"
                                                e.currentTarget.style.color = "#a1a1aa"
                                            }
                                        }}
                                    >
                                        {option}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </>
    )
}