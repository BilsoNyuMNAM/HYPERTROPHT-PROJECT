import jwt from 'jsonwebtoken';
import express from "express"
import schema from '../helper/createUserschema.js';

const user = express()

//@ts-ignore
function createCredentialCheck(req, res, next){
    const usercredential = req.credentails
    const result = schema.safeParse(usercredential) //hold the result of the validation
    if(result.success == true){
        next(); //ready for database operation
    }
    else{           
        const errors: Record<string, string[]> = {};
        for (const issue of result.error.issues) {
            const field = issue.path.join(".") || "body";
            (errors[field] ??= []).push(issue.message);
        }
        res.status(400).json({
            message: "validation failed",
            errors
        })
    }
}
//route for creating a user 
user.post("/create",createCredentialCheck, (req,res)=>{
    //1. save the credential in dataase

    //2. generate a jwt
    // 

})



export default user
