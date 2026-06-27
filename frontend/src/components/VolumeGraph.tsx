type weekvolume = {
    "starting_volume": number,
    "muscle_name": string,
    "volume_completed": number
}

function Progressbar({ weekvolume }: { weekvolume: weekvolume }) {
    const pct = weekvolume.starting_volume === 0
        ? 0
        : Math.min((weekvolume.volume_completed / weekvolume.starting_volume) * 100, 100)

    return (
        <div
            className="group"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "13px 20px",
                borderBottom: "1px solid #1e1e1e",
                transition: "background 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1f1f1f")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
            {/* Muscle name */}
            <span
                style={{
                    width: "110px",
                    flexShrink: 0,
                    fontSize: "12px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    fontWeight: 400,
                }}
            >
                {weekvolume.muscle_name}
            </span>

            {/* Progress bar track */}
            <div
                style={{
                    flex: 1,
                    height: "4px",
                    backgroundColor: "#2a2a2a",
                    borderRadius: "999px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        height: "100%",
                        width: `${pct}%`,
                        backgroundColor: "#ffffff",
                        borderRadius: "999px",
                        transition: "width 0.3s ease",
                    }}
                />
            </div>

            {/* Sets count */}
            <span
                style={{
                    width: "70px",
                    flexShrink: 0,
                    fontSize: "12px",
                    color: "#6b7280",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {weekvolume.volume_completed}/{weekvolume.starting_volume} sets
            </span>
        </div>
    )
}

export default function VolumeGraph({ weekvolume }: { weekvolume: weekvolume[] | null }) {
    return (
        <div style={{ width: "100%" }}>
            {/* Table header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 20px",
                    borderBottom: "1px solid #2a2a2a",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#6b7280",
                    fontWeight: 500,
                }}
            >
                <span>Muscle</span>
                <span>Volume</span>
            </div>

            {/* Rows */}
            <div>
                {weekvolume == null ? (
                    <p
                        style={{
                            padding: "24px 20px",
                            fontSize: "13px",
                            color: "#6b7280",
                        }}
                    >
                        Click on any week to check their volume overview
                    </p>
                ) : (
                    weekvolume.map((weekvol, i) => (
                        <Progressbar key={`${weekvol.muscle_name}-${i}`} weekvolume={weekvol} />
                    ))
                )}
            </div>
        </div>
    )
}
