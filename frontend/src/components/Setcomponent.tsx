type SessionSet = {
    id: number
    reps: string | number
    weight: string | number
    rir: string | number
}

export default function SetComponent({ setdata, addsetData, deleteSet, exerciseid}: { exerciseid:number, setdata: SessionSet, addsetData: (e:any, exerciseid:number, id:number)=>void, deleteSet: (exerciseId:number, setId:number)=>void }) {

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0",
                borderBottom: "1px solid #1e1e1e",
                padding: "12px 16px",
                transition: "background 0.1s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#161616")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
            {/* Set number */}
            <div style={{ width: "56px", flexShrink: 0 }}>
                <span
                    style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        fontVariantNumeric: "tabular-nums",
                        fontFamily: "inherit",
                    }}
                >
                    Set <span style={{ color: "#a1a1aa", fontWeight: 600 }}>{setdata.id}</span>
                </span>
            </div>

            {/* Reps */}
            <div style={{ flex: 1 }}>
                <input
                    onChange={(e) => addsetData(e, exerciseid, setdata.id)}
                    name="reps"
                    placeholder="reps"
                    value={setdata.reps}
                    style={{
                        background: "none",
                        border: "none",
                        outline: "none",
                        fontSize: "13px",
                        color: "#ffffff",
                        width: "100%",
                        fontFamily: "inherit",
                    }}
                />
            </div>

            {/* Weight */}
            <div style={{ flex: 1 }}>
                <input
                    onChange={(e) => addsetData(e, exerciseid, setdata.id)}
                    name="weight"
                    placeholder="weight"
                    value={setdata.weight}
                    style={{
                        background: "none",
                        border: "none",
                        outline: "none",
                        fontSize: "13px",
                        color: "#ffffff",
                        width: "100%",
                        fontFamily: "inherit",
                    }}
                />
            </div>

            {/* RIR */}
            <div style={{ flex: 1 }}>
                <input
                    onChange={(e) => addsetData(e, exerciseid, setdata.id)}
                    data-setid={setdata.id}
                    name="rir"
                    placeholder="rir"
                    value={setdata.rir}
                    style={{
                        background: "none",
                        border: "none",
                        outline: "none",
                        fontSize: "13px",
                        color: "#ffffff",
                        width: "100%",
                        fontFamily: "inherit",
                    }}
                />
            </div>

            {/* Delete */}
            <div style={{ flexShrink: 0 }}>
                <button
                    onClick={() => deleteSet(exerciseid, setdata.id)}
                    data-setid={setdata.id}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "11px",
                        color: "#3f3f46",
                        fontFamily: "inherit",
                        letterSpacing: "0.04em",
                        transition: "color 0.15s",
                        padding: "2px 4px",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#3f3f46")}
                >
                    Delete
                </button>
            </div>
        </div>
    )
}
