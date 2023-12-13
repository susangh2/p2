import dotenv from "dotenv";
import populateEnv from "populate-env";

dotenv.config();

export let env = {
  DB_NAME: "",
  DB_USERNAME: "",
  DB_PASSWORD: "",
  PORT: 8080,
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  EMAIL_ADDRESS: "",
  EMAIL_USER: "",
  EMAIL_PASSWORD: "",
};

populateEnv(env, { mode: "halt" });
