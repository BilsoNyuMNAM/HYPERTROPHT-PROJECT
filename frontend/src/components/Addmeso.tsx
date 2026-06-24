
import { useNavigate } from "react-router-dom"
import Logout from "./Logout";
export default function Addmesobutton(){
    const navigate = useNavigate()
    const jwt = window.localStorage.getItem("token")
    function Navigateto(){
        navigate("/create-mesocycle")
    }
    return(
        <div className="flex items-center justify-end gap-5">
            {
                jwt ? <Logout/> : null
            }
            <button className=" bg-[#c8ff00] text-black cursor-pointer font-spaceMono text-[12px] tracking-wide px-5 py-2.5 rounded-full" onClick={Navigateto}>
                <span className="text-lg leading-none">+ Create Mesocycle</span>
            </button>
        </div>
         
    )
}