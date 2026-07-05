type muscle = string
type volume = {
    [key: string]: number
}

export default function Volumecard({
    muscleGroup,
    volume,
    setVolume,
}: {
    muscleGroup: muscle[]
    volume: volume
    setVolume: React.Dispatch<React.SetStateAction<volume>>
}) {
    return (
        <>
            {muscleGroup.map((muscle) => {
                return (
                    <div
                        key={muscle}
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
                            {muscle}
                        </span>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <button
                                onClick={() => {
                                    setVolume({ ...volume, [muscle]: Math.max(6, volume[muscle] - 1) })
                                }}
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    border: "1px solid #2a2a2a",
                                    backgroundColor: "#111111",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    transition: "border-color 0.15s, color 0.15s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "#3f3f46"
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#2a2a2a"
                                }}
                            >
                                -
                            </button>
                            <span
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#ffffff",
                                    minWidth: "20px",
                                    textAlign: "center",
                                }}
                            >
                                {volume[muscle]}
                            </span>
                            <button
                                onClick={() => {
                                    setVolume({ ...volume, [muscle]: Math.min(20, volume[muscle] + 1) })
                                }}
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    border: "1px solid #2a2a2a",
                                    backgroundColor: "#111111",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    transition: "border-color 0.15s, color 0.15s",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = "#3f3f46"
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#2a2a2a"
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                )
            })}
        </>
    )
}
