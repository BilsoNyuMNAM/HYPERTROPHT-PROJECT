//Target RIR per week. Training weeks ramp 3-2-1-0 and every extra training week
//repeats the next value down from 3 (6 wks: 3 3 2 1 0). Final week is deload.
//shortcut: only handles 4-8 week mesocycles; longer ones would repeat 0 RIR as well.
export default function rirSchedule(length: number): number[] {
    const training = length - 1
    if (training <= 3) return [3, 2, 1, 4].slice(0, length)

    const extra = training - 4
    const rirs: number[] = []
    for (const rir of [3, 2, 1, 0]) {
        rirs.push(rir)
        if (rir > 0 && rir >= 4 - extra) rirs.push(rir)
    }
    rirs.push(6) //deload
    return rirs
}
