
import { Link } from "react-router-dom"
import { Activity, Dumbbell, Calendar, ArrowRight } from "lucide-react"

export default function Homepage() {
    return (
        <div className="min-h-screen bg-[#000000] text-[#ededed] p-6 sm:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#ededed]">
                        Hypertrophy Training Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-[#8a8a8a]">
                        Manage your mesocycles, complete workouts, and review muscle feedback.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Feedback Link */}
                    <Link
                        to="/mesocycles/12/feedback"
                        className="group flex flex-col justify-between p-6 rounded-2xl border border-[#222222] bg-[#0a0a0a] hover:bg-[#141414] hover:border-red-500/50 transition-all"
                    >
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400">
                                <Activity size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-[#ededed] group-hover:text-red-400 transition-colors">
                                Mesocycle 12 Feedback Table
                            </h2>
                            <p className="text-xs text-[#8a8a8a] leading-relaxed">
                                View muscle soreness, workload, and pump ratings for Mesocycle #12 with week filters.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-semibold text-red-500 group-hover:translate-x-1 transition-transform">
                            Open Feedback Matrix <ArrowRight size={14} className="ml-1" />
                        </div>
                    </Link>

                    {/* Workout UI Link */}
                    <Link
                        to="/mesocycles/12/week/1/days/1"
                        className="group flex flex-col justify-between p-6 rounded-2xl border border-[#222222] bg-[#0a0a0a] hover:bg-[#141414] hover:border-[#333333] transition-all"
                    >
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-[#1f1f1f] border border-[#333333] flex items-center justify-center text-[#ededed]">
                                <Dumbbell size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-[#ededed] group-hover:text-red-400 transition-colors">
                                Workout Logger (Week 1, Day 1)
                            </h2>
                            <p className="text-xs text-[#8a8a8a] leading-relaxed">
                                Enter weights, reps, and RIR for your mesocycle workouts.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-semibold text-[#8a8a8a] group-hover:text-[#ededed] group-hover:translate-x-1 transition-all">
                            Open Workout Session <ArrowRight size={14} className="ml-1" />
                        </div>
                    </Link>

                    {/* Mesocycle Builder Link */}
                    <Link
                        to="/mesocycles/builder"
                        className="group flex flex-col justify-between p-6 rounded-2xl border border-[#222222] bg-[#0a0a0a] hover:bg-[#141414] hover:border-[#333333] transition-all md:col-span-2"
                    >
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-[#1f1f1f] border border-[#333333] flex items-center justify-center text-[#ededed]">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-[#ededed] group-hover:text-red-400 transition-colors">
                                Create New Mesocycle
                            </h2>
                            <p className="text-xs text-[#8a8a8a] leading-relaxed">
                                Set frequency, pick muscle priorities, and allocate exercises.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-semibold text-[#8a8a8a] group-hover:text-[#ededed] group-hover:translate-x-1 transition-all">
                            Start Builder <ArrowRight size={14} className="ml-1" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}