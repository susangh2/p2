import { readFileSync } from "fs";
import { client } from "../src/database/database";

async function importTable(table: string) {
  let file = `data/${table}.json`;
  console.log("import:", file);
  let text = readFileSync(file).toString();
  let rows = JSON.parse(text);

  for (let row of rows) {
    // console.log("import", table, row.id);
    let result = await client.query(
      /* sql */ `
      select id from "${table}" where id = $1
  `,
      [row.id]
    );
    if (result.rowCount == 0) {
      await client.query(
        /* sql */ `
  insert into "${table}"
  (${Object.keys(row).map((key) => `"${key}"`)})
  values
  (${Object.keys(row).map((_, i) => `$${i + 1}`)})
  `,
        Object.values(row)
      );
    } else {
      let { id, ...rest } = row;
      await client.query(
        /* sql */ `
        update "${table}"
        set ${Object.keys(rest).map((key, i) => `"${key}" = $${i + 2}`)}
        where id = $1
  `,
        [id, ...Object.values(rest)]
      );
    }
  }

  let result = await client.query(
    /* sql */ `
      select max(id) as id from "${table}"
  `,
    []
  );
  let max_id = result.rows[0].id;

  await client.query(
    /* sql */ `
    ALTER SEQUENCE "${table}_id_seq"
    RESTART WITH ${max_id}
  `,
    []
  );
}

async function main() {
  await importTable("users");
  await importTable("location");
  await importTable("cuisine");
  await importTable("users_cuisine");
  await importTable("users_available_day");
  await importTable("match_records");
  await importTable("users_location");
  await importTable("private_chatrm");
  await importTable("private_msg");
  await importTable("budgets");
  await importTable("review");

  await client.end();
}

main();
