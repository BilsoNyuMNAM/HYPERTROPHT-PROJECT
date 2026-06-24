import { Card,CardContent,  } from "@/components/ui/card"
import { BarChart, XAxis, Bar, Cell , LabelList} from "recharts"
import { ChartContainer, } from "@/components/ui/chart"
export default function WhyAdaptiveVolume(){
    const chestData = [
        {
            "week":"wk 1",
            "sets":8,
            "fill":"#1E1E1E"
        },
        {
            "week":"wk 2",
            "sets":9,
            "fill":"#1E1E1E"
        },
        {
            "week":"wk 3",
            "sets":12,
            "fill":"#1E1E1E"
        },
        {
            "week":"wk 4",
            "sets":14,
            "fill":"#E8511B"
        },
        {
            "week":"Deload",
            "sets":6,
            "fill":"#1E1E1E"
        }
    ]
    const barConfig = { //"Hey chart — when you see the key sets in the data, use this color and this label."
        sets:{
            color:"#1E1E1E",
            label:"sets"
        }
    }
    return(
        <div className="text-white">
            <div>
                <h1 className="text-white text-4xl font-bold">THE <h1 className="text-[#D94929] inline">VOLUME SWEET SPOTS </h1><br></br>IS ALWAYS MOVING</h1>
                <p className="text-gray-400 text-sm font-spaceMono">Your body adapts to stress.The sets that grew muscle last <br></br>week won't cut it this week-your optimal range must <br></br> move too</p>
            </div>
            <div className="mt-10 mb-10">
                <div className="h-2 rounded bg-white my-4"></div>
                <div className="flex gap-3 p-4">
                    <div>
                        <h1 className="font-bold text-xl">MEV</h1>
                        <p className="text-gray-400 font-spaceMono">Minimum effective volume-just enough to grow </p>
                    </div>
                    <div className="px-2">
                        <h1 className="font-bold text-xl text-[#D94929]">MAV</h1>
                        <p className="text-gray-400 font-spaceMono">The active journey from MEV upward - your best growth zone</p>
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">MRV</h1>
                        <p className="text-gray-400 font-spaceMono">Maximum recoverable- past this, you break down</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-6">
                <div className="bg-[#141414] p-4 rounded-lg space-y-2 flex-1">
                    <p className="text-sm text-gray-400">TOO LITTLE</p>
                    <h1 className="text-2xl font-bold">BELOW MEV</h1>
                    <span className="text-gray-400 font-spaceMono text-sm">You maintain muscle , <br></br>but no new growth is <br></br>trigerred. Your body <br></br>has no reason to adapt or grow stronger</span>
                </div>
                <div className="bg-[#141414]  p-4 rounded-lg  space-y-2 flex-1 ">
                    <p className="text-sm  text-[#D94929]">WHERE YOU WANT TO BE</p>
                    <h1 className="text-2xl font-bold ">INSIDE MAV</h1>
                    <span className="text-gray-400 font-spaceMono text-sm">You are challenging <br></br>your muscle enough <br></br>to force adaptation<br></br>Volume rises week <br></br>over week as your<br></br>body gets stronger <br></br>and tolerate more </span>
                    <div className="border px-3 py-4 border rounded-xl mt-3 border-[#D94929] font-spaceMono text-[#D94929] bg-[#27140A]">
                        <p className="font-bold text-sm">THIS IS WHAT WE TRACK </p>
                    </div>
                </div>
                <div className="bg-[#141414] p-4 rounded-lg space-y-2 flex-1">
                    <p className="text-sm text-gray-400">TOO MUCH</p>
                    <h1 className="text-2xl font-bold">PAST MRV</h1>
                    <p className="text-gray-400 font-spaceMono text-sm">You body can't <br></br>recover fast enough <br></br>to build muscle. All <br></br>energy goes to <br></br>healing damage <br></br>instead of growth</p>
                </div>
                
            </div>
            <div className="mt-10  rounded-xl p-4 bg-[#141414]">
                <div>
                    <h1 className="text-gray-400 font-spaceMono font-bold">A REAL EXAMPLE</h1>
                </div>
                <div className="flex justify-between" >
                    <div >
                        <h1 className=" font-bold">CHEST: 12 SETS <br></br>BECOMES 18 SETS</h1>
                       <p className="text-gray-400 text-sm font-spaceMono">12 sets triggers great growth in Week 1. By Week 4, <br></br>your chest has adapted. That same 12 sets is now too <br></br>easy- you need  ~18 to stay inside you MAV  and keep growing </p>
                    </div>
                    <div>
                        <Card className="bg-[#141414]">
                            <CardContent>
                                <ChartContainer config={barConfig} className="h-[150px]">
                                    <BarChart data={chestData}>
                                        <Bar dataKey="sets">
                                            <LabelList dataKey="sets" fill="white"/>
                                            {chestData.map((entry, index) => (
                                                <Cell key={index} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                        <XAxis dataKey="week" />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div> 
        </div>
    )
}