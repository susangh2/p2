import { Router } from "express";
import { userOnlyAPI } from "../utils/guard";
import { client } from "../database/database";
import formidable from "formidable";
import { toArray, uploadDir } from "../utils/uploads";
import { HttpError } from "../utils/http-errors";
import { array, optional, object, int, string, email, id } from "cast.ts";

export let profileRouter = Router();

profileRouter.get("/profile", userOnlyAPI, async (req, res, next) => {
  try {
    console.log("Access to profile page");

    let userID = req.session.user_id;

    let result = await client.query(
      /* sql */ `
      select
        users.username 
      , users.email 
      , users.avatar 
      , users.age 
      , users.gender 
      , users.fav_food 
      , users.disliked_food 
      , users.restaurants 
      , users.interests 
      , users.meal_budget 
      from users
      where users.id = $1
        `,
      [userID]
    );
    let user = result.rows[0];

    result = await client.query(
      /* sql */ `
      select
        users_location.location_id as id
      from users_location
      where users_location.user_id = $1
        `,
      [userID]
    );
    let selected_location_ids = result.rows.map((row) => row.id);

    result = await client.query(/* sql */ `
      select
        location.id
      , location.district
      from location 
        `);
    let locations = result.rows;

    result = await client.query(
      /* sql */ `
      select
        users_cuisine.cuisine_id as id
      from users_cuisine
      where users_cuisine.user_id = $1
        `,
      [userID]
    );
    let selected_cuisine_ids = result.rows.map((row) => row.id);

    result = await client.query(/* sql */ `
      select
        cuisine.id
      , cuisine.country
      from cuisine
        `);
    let cuisines = result.rows;

    result = await client.query(/* sql */ `
    select
      *
    from budgets
      `);

    let budgets = result.rows;

    res.json({
      user,
      selected_location_ids,
      selected_cuisine_ids,
      locations,
      cuisines,
      budgets,
    });

    res.status(200);
  } catch (error) {
    next(error);
  }
});

profileRouter.post("/changeProfile", userOnlyAPI, (req, res, next) => {
  //do the change perosnal data logic
  //get the form from client side
  let form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    multiples: true,
    maxFileSize: 400 * 1024,
    allowEmptyFiles: false,
    filter(part) {
      return part.mimetype?.startsWith("image/") || false;
    },
    filename(name, ext, part, form) {
      return crypto.randomUUID() + "." + part.mimetype?.split("/").pop();
    },
  });

  form.parse(req, async (err, fields, files) => {
    console.log("update profile:", { fields });
    try {
      let input = object({
        fields: object({
          // username: string({ minLength: 1, maxLength: 25 }),
          // password: string(),
          email: email(),
          age: int({ min: 12, max: 100 }),
          gender: string(),
          location: array(id(), { minLength: 1, maxLength: 5 }),
          cuisine: array(id(), { minLength: 1, maxLength: 10 }),
          meal_budget: string(),
          fav_food: optional(string({ maxLength: 255 })),
          disliked_food: optional(string({ maxLength: 255 })),
          restaurants: optional(string({ maxLength: 255 })),
          interests: optional(string({ maxLength: 255 })),
        }),
      }).parse({ fields });

      console.log("input", input);

      let userID = req.session.user_id;
      let result = await client.query(
        /* sql */ `
              update users set email = $1, 
              age = $2, 
              gender = $3, 
              meal_budget = $4,
              fav_food = $5,
              disliked_food = $6,
              restaurants = $7,
              interests = $8
              where users.id = $9
            `,
        [
          input.fields.email,
          input.fields.age,
          input.fields.gender,
          input.fields.meal_budget,
          input.fields.fav_food,
          input.fields.disliked_food,
          input.fields.restaurants,
          input.fields.interests,
          userID,
        ]
      );
      console.log(result.rows);
      res.json({ message: "success" });
    } catch (err) {
      next(err);
    }
  });
});

profileRouter.patch("/user/avatar", (req, res, next) => {
  let form = formidable({
    uploadDir: uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    multiples: true,
    maxFileSize: 400 * 1024,
    allowEmptyFiles: false,
    filter(part) {
      return part.mimetype?.startsWith("image/") || false;
    },
    filename(name, ext, part, form) {
      return crypto.randomUUID() + "." + part.mimetype?.split("/").pop();
    },
  });
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw err;

      let filename = toArray(files.image)[0]?.newFilename;
      if (!filename) throw new HttpError(400, "missing image file");

      //update DB
      let userID = req.session.user_id;
      await client.query(
        /* sql */ `
              update users set avatar = $1 where users.id = $2
          `,
        [filename, userID]
      );

      console.log("inserted");

      res.json({ filename });
    } catch (error) {
      next(error);
    }
  });
});

profileRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(502);
      res.json({ error: "failed to destroy session" });
      return;
    }
    // res.redirect("/public/login.html");
    res.json({ message: "session destroyed" });
  });
});

// loginRouter.post("/resetpassword/confirm", async (req, res, next) => {
//   try {
//     let { code, password } = req.body;
//     if (typeof password !== "string") {
//       throw new HttpError(400, "invalid password");
//     }
//     let result = await client.query(
//       /* sql */ `
//       update users set passsword_hash = $1
//       where code = $2
//         `,
//       [await hashPassword(password), code]
//     );

//     let user = result.rows[0];
//     if (!user) throw new HttpError(401, "This email did not register");
//     console.log(user);

//     res.json({ message: "check you email" });
//     // sendResetPasswordMail(String(email));
//   } catch (err) {
//     next(err);
//   }
// });
