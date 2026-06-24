 import { Hono } from "hono";
import { getPrismaClient} from "../../../../lib/prismaClient.js";
import { encodeJwt } from "../../../utils/jwt.js";
import { hashPassword } from "../../../utils/passwordHashing.js";
import findUser from "../../../utils/findUser.js";
import bcrypt from 'bcryptjs';
import { Signupschema, LoginSchema } from "../../../utils/inputValidation.js";
import { findDuplicate } from "../../../utils/deplicate.js";
import { createUser } from "../../../utils/createUser.js";
import { create } from "node:domain";
 const signupRoute = new Hono<{ Bindings: { DATABASE_URL: string; JWT_TOKEN: string } }>();

 signupRoute.post("/signup", async (c)=>{
    const prisma = getPrismaClient(c.env)
    const {name, email, password} = await c.req.json();
   
    const isItsafe = Signupschema.safeParse({username:name, email, password});
     
    if(!isItsafe.success){
        const errors = isItsafe.error.flatten().fieldErrors;
        return c.json(
            {
            errors,
            },
            400
        );
    }

    const result = await findDuplicate(name, email, prisma);
    
    if(!result){ //IF NO DUPLICATE IS FOUND LET THE USER CREATE THE ACCOUNT 
        const hashedPassword = await hashPassword(password)
        try{
            const result = await createUser(name, email, hashedPassword, prisma)
            const token = await encodeJwt(c.env.JWT_TOKEN, {userID: result.id})
            return c.json({
                message:"User created successfully",
                token: token
            })
        }
        catch(error){
            return c.json({error: "Error creating user"}, 500)
        
        }
    }
    else{ //ELSE RETURN WHAT IS BEING DUPLICATED
        if (result.email === email && result.username === name) {
            return c.json({ error: "Both username and email are already taken" }, 409);
        } else if ( result.username === name) {
            return c.json({ error: "Username is already taken" }, 409);
        } else {
            return c.json({ error: "Email is already taken" }, 409);
        }
    }
    
    

 })

 signupRoute.post("/login", async (c)=>{
    const {email, password} = await c.req.json();
    const isItsafe = LoginSchema.safeParse({email, password});
    if(!isItsafe.success){
        const errors = isItsafe.error.flatten().fieldErrors;
        return c.json(
            {
            errors,
            },
            400
        );
    }
    const prisma = getPrismaClient(c.env)
    const result = await findUser(email, prisma)
    if(!result){
        return c.json({
            message:" User not found"
        }, 404)
    }
    
    const isMatch = await bcrypt.compare(password, result.password)
    if(isMatch){
        const token = await encodeJwt(c.env.JWT_TOKEN, {userID: result.id})
        return c.json({
            message:"Login successful",
            token: token
        })
    }
    
    return c.json({
        message:"Incorrect password"
    },401)
   
 })




 export default signupRoute