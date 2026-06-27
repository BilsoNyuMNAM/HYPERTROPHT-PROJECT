import { Card, CardContent } from "@/components/ui/card"
import { BarChart, XAxis, Bar, Cell, LabelList } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

export default function WhyAdaptiveVolume(){
    const chestData = [
        { week: "Wk 1", sets: 8,  fill: "#2A2A2A" },
        { week: "Wk 2", sets: 9,  fill: "#2A2A2A" },
        { week: "Wk 3", sets: 12, fill: "#2A2A2A" },
        { week: "Wk 4", sets: 14, fill: "#F5F5F5" },
        { week: "Deload", sets: 6, fill: "#2A2A2A" },
    ]
    const barConfig = {
        sets: { color: "#2A2A2A", label: "sets" }
    }

    const zones = [
        {
            label: "TOO LITTLE",
            title: "BELOW MEV",
            desc: "You maintain muscle, but no new growth is triggered. Your body has no reason to adapt or grow stronger.",
            accent: "#888888",
            highlight: false,
        },
        {
            label: "WHERE YOU WANT TO BE",
            title: "INSIDE MAV",
            desc: "You are challenging your muscle enough to force adaptation. Volume rises week over week as your body gets stronger and tolerates more.",
            accent: "#4CAF7D",
            highlight: true,
        },
        {
            label: "TOO MUCH",
            title: "PAST MRV",
            desc: "Your body can't recover fast enough to build muscle. All energy goes to healing damage instead of growth.",
            accent: "#E05C5C",
            highlight: false,
        },
    ]

    return(
        <div>
            <p className="font-spaceMono text-xs mb-3" style={{ color: "#888888" }}>VOLUME SCIENCE</p>
            <h2 className="font-bebas text-5xl font-bold mb-3" style={{ color: "#F5F5F5" }}>
                THE <span style={{ color: "#4CAF7D" }}>VOLUME SWEET SPOT</span><br/>IS ALWAYS MOVING
            </h2>
            <p className="font-spaceMono text-xs mb-10" style={{ color: "#888888" }}>
                Your body adapts to stress. The sets that grew muscle last week<br/>
                won't cut it this week — your optimal range must move too.
            </p>

            <div className="rounded-xl p-5 mb-6" style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                <div className="flex gap-6 flex-wrap">
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="h-1.5 rounded-full w-full" style={{ background: "#2A2A2A" }} />
                        <div>
                            <h3 className="font-bebas text-xl" style={{ color: "#F5F5F5" }}>MEV</h3>
                            <p className="font-spaceMono text-xs" style={{ color: "#888888" }}>Minimum effective volume</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="h-1.5 rounded-full w-full" style={{ background: "#4CAF7D" }} />
                        <div>
                            <h3 className="font-bebas text-xl" style={{ color: "#4CAF7D" }}>MAV</h3>
                            <p className="font-spaceMono text-xs" style={{ color: "#888888" }}>Your best growth zone</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="h-1.5 rounded-full w-full" style={{ background: "#E05C5C" }} />
                        <div>
                            <h3 className="font-bebas text-xl" style={{ color: "#E05C5C" }}>MRV</h3>
                            <p className="font-spaceMono text-xs" style={{ color: "#888888" }}>Maximum recoverable</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {zones.map((zone, i) => (
                    <div
                        key={i}
                        className="rounded-xl p-5 flex flex-col gap-3"
                        style={{
                            background: "#1A1A1A",
                            border: `1px solid ${zone.highlight ? zone.accent + "55" : "#2A2A2A"}`,
                        }}
                    >
                        <p className="font-spaceMono text-xs" style={{ color: zone.accent }}>
                            {zone.label}
                        </p>
                        <h3 className="font-bebas text-2xl" style={{ color: "#F5F5F5" }}>
                            {zone.title}
                        </h3>
                        <p className="font-spaceMono text-xs leading-relaxed" style={{ color: "#888888" }}>
                            {zone.desc}
                        </p>
                        {zone.highlight && (
                            <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "#4CAF7D1A", border: "1px solid #4CAF7D33" }}>
                                <p className="font-spaceMono text-xs font-bold" style={{ color: "#4CAF7D" }}>
                                    ← THIS IS WHAT WE TRACK
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="rounded-xl p-6" style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
                <p className="font-spaceMono text-xs mb-4" style={{ color: "#888888" }}>A REAL EXAMPLE</p>
                <div className="flex flex-wrap justify-between gap-6 items-start">
                    <div className="flex-1 min-w-[200px]">
                        <h3 className="font-bebas text-2xl mb-2" style={{ color: "#F5F5F5" }}>
                            CHEST: 12 SETS<br/>BECOMES 18 SETS
                        </h3>
                        <p className="font-spaceMono text-xs leading-relaxed" style={{ color: "#888888" }}>
                            12 sets triggers great growth in Week 1. By Week 4,<br/>
                            your chest has adapted. That same 12 sets is now too<br/>
                            easy — you need ~18 to stay inside your MAV and keep growing.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <Card style={{ background: "transparent", border: "none" }}>
                            <CardContent className="p-0">
                                <ChartContainer config={barConfig} className="h-[140px] w-[220px]">
                                    <BarChart data={chestData} barSize={28}>
                                        <Bar dataKey="sets" radius={[4, 4, 0, 0]}>
                                            <LabelList dataKey="sets" position="top" fill="#888888" style={{ fontSize: 11, fontFamily: "Space Mono" }} />
                                            {chestData.map((entry, index) => (
                                                <Cell key={index} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                        <XAxis dataKey="week" tick={{ fill: "#888888", fontSize: 10, fontFamily: "Space Mono" }} axisLine={false} tickLine={false} />
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