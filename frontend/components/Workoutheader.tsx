import { CalendarDays } from "lucide-react"

interface headerdata {
    name: string
    weeknumber: number
    daynumber: number
    label: string
    openCloseCalender: any
    isCalenderopen: boolean
}

export default function Workoutheader({ name, weeknumber, daynumber, label, openCloseCalender, isCalenderopen }: headerdata) {
    return (
        <header className="flex items-start justify-between gap-4 border-b border-[#222222] pb-5">
            <div className="min-w-0">
                <h1 className="text-2xl sm:text-[1.75rem] font-semibold tracking-tight leading-tight text-[#ededed]">
                    {name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="text-[#8a8a8a]">Week {weeknumber}</span>
                    <span className="text-[#8a8a8a]">Day {daynumber}</span>
                    <span className="font-medium text-[#ededed]">{label}</span>
                </div>
            </div>

            <button
                type="button"
                onClick={() => openCloseCalender(!isCalenderopen)}
                aria-expanded={isCalenderopen}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#222222] bg-[#0a0a0a] px-3 py-2 text-sm font-medium text-[#8a8a8a] transition-colors hover:border-[#333333] hover:bg-[#141414] hover:text-[#ededed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ededed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]"
            >
                <CalendarDays size={16} strokeWidth={1.75} />
                Calendar
            </button>
        </header>
    )
}
