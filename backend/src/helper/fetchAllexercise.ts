import {prisma} from "../prisma.js"
let result;
export default async function fetchAllexercise() {
  result = await prisma.exercise.findMany();
  return result
}
