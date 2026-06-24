import { Card,CardHeader,CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Line, LineChart,XAxis, YAxis, ResponsiveContainer } from "recharts"

export default function ChartCard(){
    const chartData = [
        {
            "week":"Week 1",
            "volume":30,
        },
        {
            "week":"Week 2",
            "volume":40
        },
        {
            "week":"Week 3",
            "volume":50
        },
        {
            "week":"Week 4",
            "volume":60
        },
        {
            "week":"Week 5",
            "volume":60
        },
        {
            "week":"Week 6",
            "volume":100
        }
    ]
    return(
        <Card className="bg-[#141414] border-[#1D1F22] border-2 text-white font-barlow w-full">
            <CardHeader>
                <CardTitle>Adaptive Volume Output</CardTitle>      
                <CardDescription>Weekly load vs feedback score</CardDescription>      
            </CardHeader>
            <CardContent >
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}  >
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Line dataKey="volume" stroke="#F25E3D">
                        </Line>
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
       
    )
}