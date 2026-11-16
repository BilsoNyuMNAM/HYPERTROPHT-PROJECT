const weeklyLayout: Record<number, string[]> = {
    2: ["Monday", "Thursday"],
    3: ["Monday", "Wednesday", "Friday"],
    4: ["Monday", "Tuesday", "Thursday", "Saturday"],
    5: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    6: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
}

const numberMapping: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7
}

export function getTrainingDays(daysPerWeek: number): string[] {
    return weeklyLayout[daysPerWeek] ?? weeklyLayout[4]
}

function generateCombinations(size: number, days: string[]): string[][] {
    if (size === 0) {
        return [[]]
    }

    const combinations: string[][] = []

    for (let i = 0; i < days.length; i++) {
        const rest = generateCombinations(size - 1, days.slice(i + 1))
        for (const combination of rest) {
            combinations.push([days[i], ...combination])
        }
    }

    return combinations
}

function calculatePenaltyScore(combination: string[]) {
    const number: number[] = []
    let penaltypoint = 0

    for (let i = 0; i < combination.length; i++) {
        number.push(numberMapping[combination[i]])
    }

    for (let i = 0; i < number.length; i++) {
        const nextNumber = number[i === number.length - 1 ? 0 : i + 1]
        const gap = Math.abs(number[i] - nextNumber)
        const circularGap = Math.min(gap, 7 - gap)

        if (circularGap === 1) {
            penaltypoint += 3
        } else if (circularGap === 2) {
            penaltypoint += 2
        } else {
            penaltypoint += 1
        }
    }

    return penaltypoint
}

const EPSILON = 1e-9

// Variance of exercises-per-day if `slots` were placed round-robin on `days`.
function varianceAfterPlacing(days: string[], slots: number, schedule: Record<string, any[]>): number {
    const loads = Object.keys(schedule).map((day) => {
        const base = schedule[day]?.length || 0
        const index = days.indexOf(day)
        if (index === -1) {
            return base
        }
        // mirrors distributeExercises: slot % days.length
        return base + Math.floor(slots / days.length) + (index < slots % days.length ? 1 : 0)
    })

    const mean = loads.reduce((sum, load) => sum + load, 0) / loads.length
    return loads.reduce((sum, load) => sum + (load - mean) ** 2, 0) / loads.length
}

function pickBestCombination(combinations: string[][], slots: number, schedule?: Record<string, any[]>): string[] {
    let bestCombination = combinations[0]

    if (!schedule) {
        let minPenalty = Infinity
        for (const combination of combinations) {
            const penalty = calculatePenaltyScore(combination)
            if (penalty < minPenalty) {
                minPenalty = penalty
                bestCombination = combination
            }
        }
        return bestCombination
    }

    // Balance first, spacing only breaks a variance tie.
    let bestVariance = Infinity
    let bestPenalty = Infinity

    for (const combination of combinations) {
        const variance = varianceAfterPlacing(combination, slots, schedule)
        const penalty = calculatePenaltyScore(combination)

        const moreBalanced = variance < bestVariance - EPSILON
        const equallyBalanced = Math.abs(variance - bestVariance) <= EPSILON
        if (moreBalanced || (equallyBalanced && penalty < bestPenalty)) {
            bestCombination = combination
            bestVariance = variance
            bestPenalty = penalty
        }
    }

    return bestCombination
}

function getDaysForMuscle(sessionsCount: number, trainingDays: string[], schedule?: Record<string, any[]>, exerciseCount = sessionsCount) {
    if (sessionsCount >= trainingDays.length) {
        return trainingDays
    }

    const combinations = generateCombinations(sessionsCount, trainingDays)
    return pickBestCombination(combinations, exerciseCount, schedule)
}

export default getDaysForMuscle
