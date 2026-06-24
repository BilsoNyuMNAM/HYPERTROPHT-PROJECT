import HeroText from "../components/LandingPageComponent/HeroText";
import HeroButton from "../components/LandingPageComponent/HeroButton";
import ChartCard from "@/components/LandingPageComponent/ChartCard";
import { Navigate } from "react-router-dom";
import Feedback from "@/components/LandingPageComponent/Feedback";
import WhyAdaptiveVolume from "@/components/LandingPageComponent/WhyAdaptivevolume";
import Footer from "@/components/LandingPageComponent/Footer";

export default function LandingPage(){
   
    const token = window.localStorage.getItem("token")
    
    return (
        <>
        {
            token ? <Navigate to="/Allmesocycle" /> : <div className="bg-black min-h-screen w-full p-4 flex items-center justify-center">
                <div className=" max-w-6xl px-6 flex flex-col">
                    <div className="flex gap-5 items-center justify-between flex-wrap mb-10">
                        <div >
                            <HeroText />
                            <HeroButton />
                        </div>
                        <div className="flex-1">
                            <ChartCard />
                        </div>
                    </div>

                    <div className="mt-25" id="feedback">
                        <Feedback />
                    </div>

                    <div className="mt-25">
                        <WhyAdaptiveVolume/>
                    </div>
                    
                    <Footer/>
                    
                </div>
            </div>
                }
        </>
        
    
);
}



