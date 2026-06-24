


export default function Feedback(){
     return(
        <div className="text-white font-barlow " >
            <div> {/*the outer div*/}
                <div>   
                    <h2 className="text-2xl font-bold font-spaceMono">
                        Feedback regulates volume
                    </h2>
                    <p className="text-sm mt-2 font-spaceMono text-gray-400">
                        A three-step loop that continually adaps your training load <br></br>based on how your body actually responds
                    </p>
                </div>
                <div className="flex flex-wrap">
                    <div className="border-2  rounded-lg border-[#1D1F22] flex gap-3 p-4 flex-col bg-[#141414] ">
                        <div className="flex items-center justify-center text-[#D94929]">01</div>
                        <div className="flex items-center justify-center "><h2>Log Feedback</h2></div>
                        <div className="text-gray-400"><p>Rate soreness, performance, and readiness<br></br>after each session.Takes under 20 seconds</p></div>
                    </div>

                    <div className="flex items-center text-[#D94929] px-2">
                        →
                    </div>

                    <div className="border-2  rounded-lg border-[#1D1F22] p-4 flex gap-3 flex-col bg-[#141414]">
                        <div className="flex items-center justify-center text-[#D94929]">02</div>
                        <div className="flex items-center justify-center font-bold"><h2>Model Adjusts Volume</h2></div>
                        <div className="text-gray-400"><p>Our algorithm weighs your feedback agaist <br></br>training history to recalculate optiomal sets per<br></br>muscle</p></div>
                    </div>

                    <div className="flex items-center text-[#D94929] px-2">
                        →
                    </div>


                    <div className="border-2  rounded-lg border-[#1D1F22] flex gap-3 flex-col p-4 bg-[#141414]">
                       <div className="flex items-center justify-center text-[#D94929]">03</div>
                        <div className="flex items-center justify-center font-bold"><h2>Next Volume Adapts</h2></div>
                        <div className="text-gray-400"><p >Your updated plan is ready -- more volume <br></br>when you're thriving, less when you're not </p></div>
                    </div>
                </div>
            </div>
        </div>
     )
}