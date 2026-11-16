import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { noOfexerciseAndsessionContext } from "../helper/context"

function Frequency() {
  const {trainingDays} = useContext(noOfexerciseAndsessionContext)
  const frequency = trainingDays
  const { setTrainingDays } = useContext(noOfexerciseAndsessionContext)
  const navigate = useNavigate()

  const options = [
    { value: 2, label: "2 days" },
    { value: 3, label: "3 days" },
    { value: 4, label: "4 days" },
    { value: 5, label: "5 days" },
    { value: 6, label: "6 days" },
  ]

  const handleContinue = () => {
    
      navigate("/mesocycles/plan/builder/priorities")
    
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] text-[#ededed] flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#222222] rounded-2xl p-8 sm:p-12 shadow-[0_1px_2px_rgba(0,0,0,0.4)] flex flex-col">
        <div className="flex items-center justify-between text-[#707070] mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#a1a1a1] hover:text-[#ededed] transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4 stroke-[2.2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="p-1 text-[#707070] hover:text-[#ededed] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 stroke-[2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-[#707070] block mb-2">
            Mesocycle Builder
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-[#ededed] leading-tight">
            Training Frequency
          </h1>
          <p className="text-[#a1a1a1] text-base sm:text-lg mt-2 font-normal">
            How many days per week can you consistently train?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {options.map((option) => {
            const isSelected = frequency === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {setTrainingDays(option.value)}}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl text-left transition-all duration-150 cursor-pointer border ${
                  isSelected
                    ? "bg-[#141414] border-[#ededed] ring-1 ring-[#ededed] text-[#ffffff]"
                    : "bg-[#0a0a0a] border-[#222222] text-[#ededed] hover:border-[#444444] hover:bg-[#111111]"
                }`}
              >
                <span className="text-base sm:text-lg font-medium">
                  {option.label}
                </span>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-2 border-[#ededed]"
                      : "border border-[#333333]"
                  }`}
                >
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ededed] block" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 pt-2">
          <button
            type="button"
            onClick={handleContinue}
              className="w-full py-4 rounded-lg font-bold text-sm tracking-wider uppercase text-white bg-[#e52525] hover:bg-[#d01e1e] active:scale-[0.99] transition-all duration-150 shadow-lg shadow-red-950/30 cursor-pointer"
            
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default Frequency
