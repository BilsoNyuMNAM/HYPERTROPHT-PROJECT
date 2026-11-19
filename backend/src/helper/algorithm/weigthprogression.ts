
/*
this function will do 2 things : 
1) calculate the recommended weight with same rep and 1 rir less 
2) calculate the target reps based on the rir of the week + the weight the user have selected 
*/


/*
1%rm of target rir/ 1%rm of lastweekrir = 1.025 (always the same ) , 
recommend weight = lastweekweight x 1%rm of target rir/ 1%rm of lastweekrir 
recommended weight = lastweekweight x 1.025 
*/

// lookuptable[index] = % of 1RM, where index = reps + rir - 1
const lookuptable = [
  100.00, 97.55, 95.17, 92.84, 90.57, 88.35, 86.19, 84.09, 82.03, 80.02, // sums 1-10
  78.07, 76.16, 74.29, 72.48, 70.70, 68.97, 67.29, 65.64, 64.04, 62.47,  // sums 11-20
  60.94, 59.45, 58.00, 56.58, 55.19, 53.84, 52.53, 51.24, 49.99, 48.77,  // sums 21-30
  47.57, 46.41, 45.28, 44.17, 43.09, 42.03, 41.01, 40.00, 39.02, 38.07,  // sums 31-40
];
export default function Weightprogression(lastweekweight:number){

    //1
    const targetWeight = lastweekweight*1.025 
    return targetWeight
}


export function repCalculation(lastweekweight:number, selectedWeight:number, targetRir:number, lastweekrep:number, lastweekrir:number){
      //2. calculating reps based on the entered weight 
    //a. calculated the 1rm :
    if(lastweekrep <= 0) return null //skipped set is saved as -1, same rule as Repprogression
    if(lastweekweight <= 0) return null //bodyweight set: 1RM cannot come from the added weight
    if(selectedWeight <= 0) return null //no weight typed yet


    const index = (lastweekrep+lastweekrir)-1
    if(index >= lookuptable.length) return null //bad data
    
    const percentageIndecimal = lookuptable[index]! / 100;
    const OnerepMax = lastweekweight/percentageIndecimal


    //b. find out how much is the selected weight to 1rm 
    const howMuch = (selectedWeight/OnerepMax)*100

    //c. use this % and the target rir to get the rep
    //we only scan the targetRir row : index = rep + targetRir - 1
    let difference = Infinity
    let closestRep = 1; //the rep whose % in the lookup is close to howMuch
    for(let rep=1; rep<=30; rep++){
        const i = rep + targetRir - 1
        if(i >= lookuptable.length) break
        const diff = Math.abs(howMuch - lookuptable[i]!)
        if(diff < difference){
            difference = diff
            closestRep = rep
        }
    }
    //index = rep + targetRir - 1  =>  rep = index - targetRir + 1
    return closestRep
}