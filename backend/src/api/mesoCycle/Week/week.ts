import {getPrismaClient} from "../../../../lib/prismaClient";
import {Hono} from "hono";
const weekRoute   = new Hono<{ Bindings: { DATABASE_URL: string } }>();
type PrismaClient = ReturnType<typeof getPrismaClient>;


export async function week(prisma:PrismaClient, id:number, numberOfweeks:number){
    const data = [];
        for(let i=1; i<=numberOfweeks; i++){
            data.push({
                week_name: `week ${i}`,
                mesocycleId: id
            })
        }
    const weekResult = await prisma.week.createManyAndReturn({
        data:data
    })
    return weekResult; // this will not gets executed until the await operation is completed 
}

