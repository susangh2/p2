import expressSession from "express-session";
import crypto from "crypto";

export let sessionMiddleware = expressSession({
  resave: true,
  saveUninitialized: true,
  secret: crypto.randomBytes(32).toString("hex"),
});

declare module "express-session" {
  interface SessionData {
    username: string;
    user_id: number;
  }
}
