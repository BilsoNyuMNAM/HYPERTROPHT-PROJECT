
import { useState } from "react";

export default function DeleteDialog({
    onConfirm,
    onCancel
}: {
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const [cancelHovered, setCancelHovered] = useState(false);
    const [deleteHovered, setDeleteHovered] = useState(false);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
                fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
            }}
        >
            <div
                style={{
                    backgroundColor: "#161618",
                    border: "1px solid #2a2a2a",
                    borderRadius: "12px",
                    padding: "32px",
                    maxWidth: "400px",
                    width: "100%",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)",
                }}
            >
                <div>
                    <div>
                        <h1
                            style={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: "#ffffff",
                                marginBottom: "12px",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Delete Item?
                        </h1>
                    </div>
                    <div style={{ marginBottom: "24px" }}>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#a1a1aa",
                                lineHeight: "1.5",
                            }}
                        >
                            This action cannot be undone. This will permanently delete the item.
                        </p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            onMouseEnter={() => setCancelHovered(true)}
                            onMouseLeave={() => setCancelHovered(false)}
                            style={{
                                border: "1px solid #2a2a2a",
                                borderRadius: "6px",
                                padding: "8px 18px",
                                fontSize: "11px",
                                fontWeight: 500,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: cancelHovered ? "#ffffff" : "#a1a1aa",
                                backgroundColor: cancelHovered ? "#1e1e1e" : "transparent",
                                borderColor: cancelHovered ? "#3f3f46" : "#2a2a2a",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "all 0.15s ease",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            onMouseEnter={() => setDeleteHovered(true)}
                            onMouseLeave={() => setDeleteHovered(false)}
                            style={{
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                borderRadius: "6px",
                                padding: "8px 18px",
                                fontSize: "11px",
                                fontWeight: 500,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                color: deleteHovered ? "#ffffff" : "#ef4444",
                                backgroundColor: deleteHovered ? "#ef4444" : "rgba(239, 68, 68, 0.1)",
                                borderColor: deleteHovered ? "#ef4444" : "rgba(239, 68, 68, 0.2)",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "all 0.15s ease",
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}