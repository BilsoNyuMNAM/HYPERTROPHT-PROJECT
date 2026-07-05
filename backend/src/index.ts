import {Hono} from "hono";
import cycle from "./api/mesoCycle/create";
import {cors} from "hono/cors";
import volumeRoute from "./api/mesoCycle/Week/Volume/volume";
import sessionRoute from "./api/mesoCycle/Session/route";
import frequencyroute from "./api/mesoCycle/Frequency/frequency";
import weekProgressionRoute from "./api/mesoCycle/Week/route";
import signupRoute from "./api/mesoCycle/Singup/signup";
import muscleToggleRoute from "./api/mesoCycle/muscleToggleRoute";
const app = new Hono();
app.use(cors())


app.get("/home", async (c)=>{
	return c.json({
		message: "😆 you cant do anthing in this p",
	})
})
 


app.route("/api/v1/mesoCycle/session", sessionRoute)
app.route("/api/v1/mesoCycle/volume", volumeRoute)
app.route("/api/v1/mesoCycle/frequency", frequencyroute)
app.route("/api/v1/mesoCycle/muscle", muscleToggleRoute)
app.route("/api/v1/mesoCycle/week", weekProgressionRoute)
app.route("/api/v1/mesoCycle", cycle);
app.route("/api/v1/mesoCycle", signupRoute)
export default app;
