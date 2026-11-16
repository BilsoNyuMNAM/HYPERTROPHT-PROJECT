export default function Repprogression(lastweekrep:number|null, lastrir:number, nextrir:number){
    //if a lifter does 10 reps last week , what tells us how many reps to add for the next week ? - RIR
    
    
    if(lastweekrep == null|| lastweekrep==-1){ //if it is first week return null or if a set is skipped(-1)
        ////if the lifter skipped that set last week, so lastweekrep(reps colum) is saved as -1, What should this function do??? - we have no real reps to build on
        return null 
    }
    //If a lifter did 10 reps at 3 RIR last week, and next week's target is 2 RIR, how many reps should they aim for next week? - 11
    const nextrep =lastweekrep + (lastrir -nextrir)
    


    return nextrep
}