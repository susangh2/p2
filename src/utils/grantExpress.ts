import grant from "grant";
import { env } from "../env";

export let grantExpress = grant.express({
  defaults: {
    origin: "http://localhost:8080",
    transport: "session",
    state: true,
  },
  google: {
    key: env.GOOGLE_CLIENT_ID || "",
    secret: env.GOOGLE_CLIENT_SECRET || "",
    scope: ["profile", "email"],
    callback: "/login/google",
  },
});
