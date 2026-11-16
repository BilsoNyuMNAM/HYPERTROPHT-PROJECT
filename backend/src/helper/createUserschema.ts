import { z} from "zod"
const schema = z.object({
    username:z.string("username cannot be null") ,
    email:z.string().email("Invalid email") ,
    password:z.string().regex(/\d/, "Expects number").regex(/[!@#$%^&*]/ , "expects special character").min(6,"minimum length should be 6")
})

export default schema