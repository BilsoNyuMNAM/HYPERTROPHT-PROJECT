import { Context, Next } from "hono";
import { decodeJwt } from "./jwt";

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header("Authorization")?.split(" ")[1] || null;
  if (!token || token === "null") {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const userId = await decodeJwt(token, c.env.JWT_TOKEN);
  if (!userId) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  c.set("userId", userId);
  return next();
}
