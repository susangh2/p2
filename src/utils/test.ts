import { client } from "../database/database";
import { checkPassword } from "./hash";

// async function main() {
//   let result = await client.query("select price_range from budgets");
//   console.log(result.rows[0]);
//   client.end();
// }

// main();

// async function getCusine() {
//   let result = await client.query(
//     `INSERT INTO "usersforTest" (username, email, password_hash, avatar, age, gender, fav_food, disliked_food, restaurants, interests, meal_budget) VALUES ('fakeuser5', 'test@test.com', '$2a$10$LvJbeHKCxB/8hG76j8kr2ewNZwO2AufIe4h/omBtJAg6W7oWB1Zhe', 'test.jpg', 20, 'male', '', '', 'test_restaurants', 'test-interested', 'below $50') returning id;`
//   );

//   let user = result.rows[0].id;
//   console.log(user);
//   client.end();
// }

async function takeUserInformation(username: string) {
  let result = await client.query(
    `			select id, password_hash
    from "usersforTest"
    where username = $1
  `,
    [username],
  );
  let user = result.rows[0];
  console.log(user);
  let check = await checkPassword("haha", result.rows[0].password_hash);
  console.log(check);
  client.end();
}

takeUserInformation("haha");
