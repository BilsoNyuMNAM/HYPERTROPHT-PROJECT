import { z } from "zod";

const Signupschema = z.object({
  username: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address").endsWith("@gmail.com", "Invalid email address"),
})

const LoginSchema = z.object({
  email: z.string().email("Invalid email address").endsWith("@gmail.com", "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const validateMesocycleInput = z.object({
  name: z.string().min(1, "Name must be at least 1 character"),
  numberOfweeks: z.number().int().min(4, "Number of weeks must be at least 4").max(12, "Number of weeks must be at most 12"),
  volume: z.array(
    z.object({
      muscle_name: z.string().min(1, "Muscle name is required"),
      set: z.number().int().nonnegative("Sets must be a non-negative number")
    })
  ).min(1, "Volume array cannot be empty"),
  frequencies: z.array(
    z.object({
      muscle_name: z.string().min(1, "Muscle name is required"),
      timesPerWeek: z.number().int().positive("Times per week must be a positive number")
    })
  ).min(1, "Frequencies array cannot be empty")
})

export { Signupschema, LoginSchema, validateMesocycleInput }