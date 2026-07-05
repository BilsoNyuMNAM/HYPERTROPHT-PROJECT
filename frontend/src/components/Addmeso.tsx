import { useNavigate } from "react-router-dom"
import Logout from "./Logout";

export default function Addmesobutton() {
    const navigate = useNavigate()
    const jwt = window.localStorage.getItem("token")

    function Navigateto() {
        navigate("/create-mesocycle")
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {jwt ? <Logout /> : null}
            <button
                onClick={Navigateto}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 18px",
                    fontSize: "12px",
                    fontWeight: 500,
                    letterSpacing: "0.03em",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Create Mesocycle
            </button>
        </div>
    )
}