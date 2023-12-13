import { boolean, number, object, string } from "cast.ts";
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

// const usersSheet = workbook.Sheets.users;
// const usersSheet = workbook.Sheets.users_location;
// const usersSheet = workbook.Sheets.users_cuisine;
// const usersSheet = workbook.Sheets.users_available_day;
// const usersSheet = workbook.Sheets.review;
// const usersSheet = workbook.Sheets.private_chatrm;
const usersSheet = workbook.Sheets.private_msg;

const usersData = xlsx.utils.sheet_to_json(usersSheet);

// Parses & validates excel data
// let userParser = object({
//   username: string(),
//   age: number(),
//   gender: string(),
//   fav_food: string(),
//   disliked_food: string(),
//   restaurants: string(),
//   meal_budget: string(),
//   interests: string(),
//   avatar: string(),
// });
// let userParser = object({
//   user_id: number(),
//   location_id: number(),
// });
// let userParser = object({
//   user_id: number(),
//   cuisine_id: number(),
// });
// let userParser = object({
//   user_id: number(),
//   day: string(),
//   breakfast: boolean(),
//   brunch: boolean(),
//   lunch: boolean(),
//   tea: boolean(),
//   dinner: boolean(),
//   lateNight: boolean(),
// });

// let userParser = object({
//   rated_user_id: number(),
//   rated_by_user_id: number(),
//   rating: number(),
//   comment: string(),
//   rating_date: string(),
// });

// // let userParser = object({
//   user1_id: number(),
//   user2_id: number(),
//   status: string(),
//   status_date: string(),
// });

// let userParser = object({
//   id: number(),
//   match_id: number(),
// });

let userParser = object({
  room_id: number(),
  sender_id: number(),
  message: string(),
  created_at: number(),
  is_deleted: boolean(),
});

export async function importExcelToDB() {
  for (let object of usersData) {
    console.log(object);
    let user = userParser.parse(object);

    // let result = await client.query(
    //   /* sql */
    //   `SELECT id FROM "users" WHERE username = $1`,
    //   [user.username]
    // );
    // if (result.rowCount == 0) {
    //   await client.query(
    //     /* sql */
    //     `INSERT INTO "users" (username, age, gender, fav_food, disliked_food, restaurants, meal_budget, interests, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    //     [
    //       user.username,
    //       user.age,
    //       user.gender,
    //       user.fav_food,
    //       user.disliked_food,
    //       user.restaurants,
    //       user.meal_budget,
    //       user.interests,
    //       user.avatar,
    //     ]
    //   );
    // } else if (result.rowCount == 1) {
    //   await client.query(
    //     /* sql */ `UPDATE "users" SET age = $1, gender = $2, fav_food = $3, disliked_food = $4, restaurants = $5, meal_budget = $6, interests = $7, avatar = $8 WHERE id = $9`,
    //     [
    //       user.age,
    //       user.gender,
    //       user.fav_food,
    //       user.disliked_food,
    //       user.restaurants,
    //       user.meal_budget,
    //       user.interests,
    //       user.avatar,
    //       result.rows[0].id,
    //     ]
    //   );
    // } else {
    //   console.log('Duplicated user: ', result.rows);
    //   throw new Error('Duplicated user');
    // }

    // await client.query(
    //   /* sql */
    //   `INSERT INTO "users_location" (user_id, location_id) VALUES ($1, $2)`,
    //   [user.user_id, user.location_id]
    // );

    // await client.query(
    //   /* sql */
    //   `INSERT INTO "users_cuisine" (user_id, cuisine_id) VALUES ($1, $2)`,
    //   [user.user_id, user.cuisine_id]
    // );

    // await client.query(
    //   /* sql */
    //   `INSERT INTO "users_available_day" (user_id, day, breakfast, brunch, lunch, tea, dinner, "lateNight") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    //   [user.user_id, user.day, user.breakfast, user.brunch, user.lunch, user.tea, user.dinner, user.lateNight]
    // );

    // await client.query(
    //   /* sql */
    //   `INSERT INTO "review" (rated_user_id, rated_by_user_id, rating, comment, rating_date) VALUES ($1, $2, $3, $4, $5)`,
    //   [user.rated_user_id, user.rated_by_user_id, user.rating, user.comment, user.rating_date]
    // );

    // await client.query(
    //   /* sql */
    //   `INSERT INTO "match_records" (user1_id, user2_id, status, status_date) VALUES ($1, $2, $3, $4)`,
    //   [user.user1_id, user.user2_id, user.status, user.status_date],
    // );

    // await client.query(
    //   /* sql */
    //   `INSERT INTO "match_records" (user1_id, user2_id, status, status_date) VALUES ($1, $2, $3, $4)`,
    //   [user.user1_id, user.user2_id, user.status, user.status_date],
    // );

    // await client.query(
    //   /* sql */
    //   `INSERT INTO "private_chatrm" (id, match_id) VALUES ($1, $2)`,
    //   [user.id, user.match_id]
    // );

    let tableName = "private_msg";
    // await client.query(
    //   /* sql */
    //   `delete from "${tableName}"`,
    //   []
    // );
    // await client.query(
    //   /* sql */
    //   `ALTER SEQUENCE "${tableName}_id_seq"
    //   RESTART WITH 1`,
    //   []
    // );
    // user;
    let created_at = new Date(
      new Date("1899-12-29T16:00:00.000Z").getTime() +
        user.created_at * 24 * 60 * 60 * 1000
    );
    await client.query(
      /* sql */
      `INSERT INTO "${tableName}" (room_id, sender_id, message, created_at, is_deleted) VALUES ($1, $2, $3, $4, $5)`,
      [user.room_id, user.sender_id, user.message, created_at, user.is_deleted]
    );
    // let result = await client.query(
    //   /* sql */
    //   `INSERT INTO "${tableName}" (message) VALUES ($1) returning id`,
    //   [user.message]
    // );
    // console.log("inserted id:", result.rows[0].id);
  }
  console.log("Data insertion success");
  await client.end();
}

importExcelToDB().catch((e) => console.log(e));

// console.log(usersData[0]);
// console.log(usersData[1]);
