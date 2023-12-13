import { Router } from "express";
import formidable from "formidable";
import { toArray, uploadDir } from "../utils/uploads";
import crypto from "crypto";
import { client } from "../database/database";
import { HttpError } from "../utils/http-errors";
import { hashPassword } from "../utils/hash";
import { optional, object, int, string, email } from "cast.ts";

export let registrationRouter = Router();
let form = formidable({
  uploadDir: uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 400 * 1024,
  allowEmptyFiles: false,
  filter(part) {
    return part.mimetype?.startsWith("image/") || false;
  },
  filename(name, ext, part, form) {
    return crypto.randomUUID() + "." + part.mimetype?.split("/").pop();
  },
});

registrationRouter.post("/registration", (req, res, next) => {
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new HttpError(400, String(err));
      }
      let image = toArray(files.image)[0];
      let filename = image?.newFilename;
      if (!filename) {
        throw new HttpError(400, "missing file");
      }
      let input = object({
        fields: object({
          username: string({ minLength: 1, maxLength: 25 }),
          password: string(),
          email: email(),
          age: int({ min: 12, max: 100 }),
          Gender: string(),
          location: string({ minLength: 1, maxLength: 25 }),
          cuisineCountry: string({ minLength: 1, maxLength: 25 }),
          mealBudget: string(),
          favFood: optional(string({ maxLength: 255 })),
          disFood: optional(string({ maxLength: 255 })),
          restaurant: optional(string({ maxLength: 255 })),
          interested: optional(string({ maxLength: 255 })),
        }),
      }).parse({ fields, files });

      let locations = input.fields.location.split(",");
      let cuisines = input.fields.cuisineCountry.split(",");

      console.log("locaitons", locations);
      console.log("cuisines", cuisines);

      let result = await client.query(
        'INSERT INTO "users" (username, email, password_hash, avatar, age, gender, fav_food, disliked_food, restaurants, interests, meal_budget) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id',
        [
          input.fields.username,
          input.fields.email,
          await hashPassword(input.fields.password),
          filename,
          input.fields.age,
          input.fields.Gender,
          input.fields.favFood,
          input.fields.disFood,
          input.fields.restaurant,
          input.fields.interested,
          input.fields.mealBudget,
        ]
      );
      let user_id = result.rows[0].id;

      console.log("register", { user_id });

      for (let location of locations) {
        console.log("location", parseInt(location));
        await client.query(
          `insert into "users_location" (user_id, location_id) values ($1, $2)`,
          [user_id, parseInt(location)]
        );
      }

      for (let cuisine of cuisines) {
        console.log(parseInt(cuisine));
        await client.query(
          `insert into "users_cuisine" (user_id, cuisine_id) values ($1, $2)`,
          [result.rows[0].id, parseInt(cuisine)]
        );
      }

      res.json("sign up success");
      // res.redirect("/");
    } catch (error) {
      next(error);
    }
  });
});

registrationRouter.get("/registration/search", async (req, res, next) => {
  try {
    let { username } = req.query;
    if (!username) {
      throw new HttpError(400, "missing username");
    }
    let result = await client.query(
      /* sql */ `select id from "users" where username = $1`,
      [username]
    );
    res.json({ count: result.rowCount });
  } catch (err) {
    next(err);
  }
});

registrationRouter.get("/regnistration", async (req, res, next) => {
  try {
    let budgetResult = await client.query("select price_range from budgets");
    let cuisineResult = await client.query("SELECT * FROM cuisine;");
    let locationResult = await client.query("SELECT * from location;");
    let usernameResult = await client.query("SELECT username FROM users;");
    let budgets = budgetResult.rows;
    let cuisines = cuisineResult.rows;
    let districts = locationResult.rows;
    let usernames = usernameResult.rows;
    res.json({ budgets, cuisines, districts, usernames });
    res.status(200);
  } catch (error) {
    res.status(400);
    next(error);
  }
});
