const sorenessOptions = [
  { level: 1, label: "No Soreness" },
  { level: 2, label: "Healed Well" },
  { level: 3, label: "Just in time" },
  { level: 4, label: "Still sore" },
];
type SorenessData = { level: number; label: string } | null;
type setter = React.Dispatch<React.SetStateAction<SorenessData>>
export default function Feedback({ musclename, setSorenessLog, sorenessLog }: { musclename: string; setSorenessLog: setter; sorenessLog: SorenessData }) {
  return (
    <div>
      <div className="p-5 border-2 border-[rgb(201,106,0)] rounded-xl bg-[rgba(180,80,0,0.18)]">
        <div className="text-[rgb(245,160,48)] text-xs font-semibold uppercase tracking-wider mb-1">
          <p>2nd {musclename} Session this week</p>
        </div>
        <div className="text-white text-xs font-medium uppercase tracking-wider mb-4">
          <p>Trained on Day 1. Rate your soreness going into this session:</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {sorenessOptions.map(({ level, label }) => {
            const isSelected = sorenessLog?.level === level;
            return (
              <button
                key={level}
                onClick={() => setSorenessLog({ level, label })}
                className={`border cursor-pointer rounded-lg py-3 px-4 flex flex-col items-center justify-center flex-1 min-w-[110px] transition-colors
                  ${isSelected ? "border-[rgb(245,160,48)] bg-[rgb(245,160,48)] text-black" : "border-[rgb(58,58,60)] bg-[rgb(28,28,30)] text-white hover:bg-[rgb(48,48,50)]"}`}
              >
                <span className="font-semibold text-lg">{level}</span>
                <span className={`text-sm text-center mt-1 ${isSelected ? "text-black" : "text-gray-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}