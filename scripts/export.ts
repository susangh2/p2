import { mkdirSync, writeFileSync } from "fs";
import { client } from "../src/database/database";

mkdirSync("data", { recursive: true });

async function exportTable(table: string) {
  let file = `data/${table}.json`;
  console.log("export", file);
  let result = await client.query(
    /* sql */ `
  select * from "${table}"
  `,
    []
  );
  let text = JSON.stringify(result.rows, null, 2) + "\n";
  writeFileSync(file, text);
}

async function main() {
  await exportTable("users");
  await exportTable("location");
  await exportTable("cuisine");
  await exportTable("users_cuisine");
  await exportTable("users_available_day");
  await exportTable("match_records");
  await exportTable("users_location");
  await exportTable("private_chatrm");
  await exportTable("private_msg");
  await exportTable("budgets");
  await exportTable("review");

  await client.end();
}

main();
