import { number, object, string, boolean, optional, id } from "cast.ts";
import { Client } from "pg";
import xlsx from "xlsx";
import { env } from "../env";

const client = new Client({
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

const file = "./sample-data.xlsx";
const workbook = xlsx.readFile(file);

const tables = [
  "users",
  "users_location",
  "users_cuisine",
  "users_available_day",
  "review",
  "match_records",
];

// Parses & validates excel data
let parserObj = {
  users: object({
    id: id(),
    username: string(),
    age: number(),
    gender: string(),
    fav_food: string(),
    disliked_food: string(),
    restaurants: string(),
    meal_budget: string(),
    interests: string(),
    avatar: string(),
    img1: string(),
    img2: string(),
  }),
  users_location: object({
    id: id(),
    user_id: number(),
    location_id: number(),
  }),
  users_cuisine: object({
    id: id(),
    user_id: number(),
    cuisine_id: number(),
  }),
  users_available_day: object({
    id: id(),
    user_id: number(),
    day: string(),
    breakfast: boolean(),
    brunch: boolean(),
    lunch: boolean(),
    tea: boolean(),
    dinner: boolean(),
    lateNight: boolean(),
  }),
  review: object({
    id: id(),
    rated_user_id: number(),
    rated_by_user_id: number(),
    rating: number(),
    comment: string(),
    rating_date: string(),
    rating_meal: string(),
    reply: optional(string()),
    reply_date: optional(string()),
  }),
  match_records: object({
    id: id(),
    user1_id: number(),
    user2_id: number(),
    status: string(),
    status_date: string(),
  }),
};

async function main() {
  for (const tableName of tables) {
    console.log("import from sheet:", tableName);
    let rows = xlsx.utils.sheet_to_json(workbook.Sheets[tableName]);
    let parser = parserObj[tableName];
    for (let row of rows) {
      let data = parser.parse(row, { name: tableName });
      await upsert(tableName, data);
    }
    await setIdSeq(tableName);
  }
  client.end();
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});

async function upsert(tableName: string, row: { id: number }) {
  let result = await client.query(
    /* sql */
    `select id from "${tableName}" where id = $1`,
    [row.id],
  );

  if (result.rowCount == 0) {
    await client.query(
      /* sql */
      `INSERT INTO "${tableName}" (${Object.keys(row)}) VALUES (${Object.keys(
        row,
      ).map((_, i) => `$${i + 1}`)})`,
      Object.values(row),
    );
  } else {
    let { id, ...rest } = row;
    await client.query(
      /* sql */
      `update "${tableName}"
      set ${Object.keys(rest)
        .map((key, i) => `set ${key} = $${i + 2}`)
        .join(" , ")}
      where id = $1
      `,
      [id, ...Object.values(rest)],
    );
  }
}

async function setIdSeq(tableName: string) {
  let result = await client.query(
    /* sql */
    `select max(id) as id from "${tableName}"`,
    [],
  );
  let id = result.rows[0].id;
  await client.query(
    /* sql */
    `update "${tableName}_id_seq" set last_value = $1, is_called = true`,
    [id],
  );
  console.log("set last id seq:", { tableName, id });
}

// async function importExcelToDB(tableName: string) {
//   let excelData = {};
//   for (let dataObject of excelData[tableName]) {
//     let row = parserObj[tableName].parse(dataObject, { name: tableName });
//     switch (tableName) {
//       case 'users':
//         return await client.query(
//           /* sql */
//           `INSERT INTO "users" (username, age, gender, fav_food, disliked_food, restaurants, meal_budget, interests, avatar, img1, img2) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
//           [
//             row.username,
//             row.age,
//             row.gender,
//             row.fav_food,
//             row.disliked_food,
//             row.restaurants,
//             row.meal_budget,
//             row.interests,
//             row.avatar,
//             row.img1,
//             row.img2,
//           ]
//         );
//       case 'users_location':
//         return await client.query(
//           /* sql */
//           `INSERT INTO "users_location" (user_id, location_id) VALUES ($1, $2)`,
//           [row.user_id, row.location_id]
//         );
//       case 'users_cuisine':
//         return await client.query(
//           /* sql */
//           `INSERT INTO "users_cuisine" (user_id, cuisine_id) VALUES ($1, $2)`,
//           [row.user_id, row.cuisine_id]
//         );
//       case 'users_available_day':
//         return await client.query(
//           /* sql */
//           `INSERT INTO "users_available_day" (user_id, day, breakfast, brunch, lunch, tea, dinner, "lateNight") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//           [row.user_id, row.day, row.breakfast, row.brunch, row.lunch, row.tea, row.dinner, row.lateNight]
//         );
//       case 'review':
//         return await client.query(
//           /* sql */
//           `INSERT INTO "review" (rated_user_id, rated_by_user_id, rating, comment, rating_date, rating_meal, reply, reply_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//           [
//             row.rated_user_id,
//             row.rated_by_user_id,
//             row.rating,
//             row.comment,
//             row.rating_date,
//             row.rating_meal,
//             row.reply !== undefined ? row.reply : null,
//             row.reply_date !== undefined ? row.reply_date : null,
//           ]
//         );
//       case 'match_records':
//         return await client.query(
//           /* sql */
//           `INSERT INTO "match_records" (user1_id, user2_id, status, status_date) VALUES ($1, $2, $3, $4)`,
//           [row.user1_id, row.user2_id, row.status, row.status_date]
//         );
//       default:
//         return console.error('Error inserting info to db');
//     }
//   }
// }

// console.log('importExcelToDB:', importExcelToDB.toString().length);
