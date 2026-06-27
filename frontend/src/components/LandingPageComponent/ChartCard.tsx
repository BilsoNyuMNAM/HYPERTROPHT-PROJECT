import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"

export default function ChartCard(){
    const chartData = [
        { week: "Wk 1", volume: 8 },
        { week: "Wk 2", volume: 10 },
        { week: "Wk 3", volume: 11 },
        { week: "Wk 4", volume: 13 },
        { week: "Wk 5", volume: 12 },
        { week: "Wk 6", volume: 15 },
    ]

    return(
        <div className="rounded-xl p-5 font-barlow" style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            {/* Header */}
            <div className="mb-4">
                <p className="font-dmSans text-xs mb-1" style={{ color: "#888888" }}>WEEKLY OUTPUT</p>
                <p className="font-bebas text-2xl tracking-wider" style={{ color: "#F5F5F5" }}>Adaptive Volume Output</p>
                <p className="font-spaceMono text-xs mt-1" style={{ color: "#888888" }}>Weekly load vs feedback score</p>
            </div>

            {/* Stats row */}
            <div className="flex gap-6 mb-4 pb-4" style={{ borderBottom: "1px solid #2A2A2A" }}>
                <div>
                    <p className="font-spaceMono text-xs" style={{ color: "#888888" }}>Current</p>
                    <p className="font-bebas text-2xl" style={{ color: "#F5F5F5" }}>12 sets</p>
                    <p className="font-spaceMono text-xs" style={{ color: "#4CAF7D" }}>↑ +50%</p>
                </div>
                <div>
                    <p className="font-spaceMono text-xs" style={{ color: "#888888" }}>Peak</p>
                    <p className="font-bebas text-2xl" style={{ color: "#F5F5F5" }}>15 sets</p>
                    <p className="font-spaceMono text-xs" style={{ color: "#888888" }}>Wk 6</p>
                </div>
                <div>
                    <p className="font-spaceMono text-xs" style={{ color: "#888888" }}>Trend</p>
                    <p className="font-bebas text-2xl" style={{ color: "#4CAF7D" }}>Progressing</p>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="week"
                        tick={{ fill: "#888888", fontSize: 11, fontFamily: "Space Mono" }}
                        axisLine={{ stroke: "#2A2A2A" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#888888", fontSize: 11, fontFamily: "Space Mono" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "#1C1C1C",
                            border: "1px solid #2A2A2A",
                            borderRadius: "8px",
                            color: "#F5F5F5",
                            fontFamily: "Space Mono",
                            fontSize: "12px",
                        }}
                        cursor={{ stroke: "#2A2A2A" }}
                    />
                    <Line
                        dataKey="volume"
                        stroke="#F5F5F5"
                        strokeWidth={1.5}
                        dot={{ fill: "#F5F5F5", r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: "#4CAF7D", r: 5, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}