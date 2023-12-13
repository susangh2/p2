import { Client } from "pg";
import { env } from "../env";

export const client = new Client({
  database: env.DB_NAME,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
});

// Checks whether connected to database
client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database.");
  })
  .catch((e) => {
    console.error("Failed to connect to PostgreSQL database:", e);
    process.exit(1);
  });

// Exit database???
