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
            token ? <Navigate to="/Allmesocycle" /> : 
            <div style={{ backgroundColor: "#111111" }} className="min-h-screen w-full">
                <div style={{ borderBottom: "1px solid #2A2A2A" }} className="w-full px-8 py-4 flex items-center justify-between">
                    <span className="font-bebas text-2xl tracking-widest" style={{ color: "#F5F5F5" }}>HYPERTROPHY</span>
                    <div className="flex gap-3">
                        <a href="/login">
                            <button className="font-dmSans text-sm px-4 py-2 rounded-lg transition-all duration-200"
                                style={{ color: "#888888", border: "1px solid #2A2A2A", background: "transparent" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#F5F5F5")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#888888")}>
                                Log in
                            </button>
                        </a>
                        <a href="/signup">
                            <button className="font-dmSans text-sm px-4 py-2 rounded-lg transition-all duration-200"
                                style={{ color: "#111111", background: "#F5F5F5" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "#D0D0D0")}
                                onMouseLeave={e => (e.currentTarget.style.background = "#F5F5F5")}>
                                Get started
                            </button>
                        </a>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 flex flex-col">
                    <div className="flex gap-10 items-center justify-between flex-wrap py-20">
                        <div className="flex-shrink-0">
                            <HeroText />
                            <HeroButton />
                        </div>
                        <div className="flex-1 min-w-[300px]">
                            <ChartCard />
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid #2A2A2A" }} className="w-full" />

                    <div className="mt-20" id="feedback">
                        <Feedback />
                    </div>

                    <div style={{ borderTop: "1px solid #2A2A2A" }} className="w-full mt-20" />

                    <div className="mt-20">
                        <WhyAdaptiveVolume/>
                    </div>
                    
                    <Footer/>
                </div>
            </div>
        }
        </>
    
);
}



