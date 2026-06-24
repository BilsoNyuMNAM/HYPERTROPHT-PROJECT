
import bcrypt from 'bcryptjs';

async function hashPassword(password:string){
    let hashedPassword = await bcrypt.hash(password, 11);
    return hashedPassword;
}

export {hashPassword};