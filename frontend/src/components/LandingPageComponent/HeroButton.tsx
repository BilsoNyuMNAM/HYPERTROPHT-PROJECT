import { Link } from "react-router-dom";
export default function HeroButton(){
    return(
        
            <div >
                <div className="flex gap-4 mt-10">
                    <a href="/signup"><button className=" py-1 px-2 rounded-xl text-white bg-[#F25E3D] font-dmSans"> Signup</button></a>
                    <button className="bg-[#0B0C0D] p-3 rounded-xl text-white border-[#1D1F22] border-2 font-dmSans "onClick={()=>{document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" })}}>See how it works</button>
                </div>
                <div className="mt-4">
                    <button className="bg-[#0B0C0D] p-3 rounded-xl text-white border-[#1D1F22] border-2 font-dmSans">Build on adaptive volume science</button>
                </div>
            </div>
        
    )
}