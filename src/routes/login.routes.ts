import { Router } from "express";
import { client } from "../database/database";
import { HttpError } from "../utils/http-errors";
import { checkPassword } from "../utils/hash";
import "../utils/session";
import crypto from "crypto";
import { hashPassword } from "../utils/hash";
import { sendResetPasswordMail } from "../utils/nodemailer";

export let loginRouter = Router();

loginRouter.post("/login", async (req, res, next) => {
  try {
    let { username, password } = req.body;
    if (!username) throw new HttpError(400, "missing username");
    if (!password) throw new HttpError(400, "missing password");

    let result = await client.query(
      `			select id, password_hash
        from "users"
        where username = $1
      `,
      [username]
    );

    let user = result.rows[0];
    if (!user) throw new HttpError(401, "wrong username or password");
    let passwordChecking = await checkPassword(
      password,
      result.rows[0].password_hash
    );

    if (!passwordChecking) {
      throw new HttpError(401, "wrong username or password");
    }
    console.log(user);

    req.session.user_id = user.id;
    // res.redirect("/public/profile.html");
    res.json({ login: "success" });
  } catch (err) {
    // console.log(err);
    // res.json({ error: err });
    // return;
    next(err);
  }
});

loginRouter.get("/login/google", async (req, res, next) => {
  let accessToken = req.session?.["grant"].response.access_token;
  let fetchRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  let json = await fetchRes.json();
  let userMail = json.email;
  console.log({ userMail });

  let user = (
    await client.query(
      /* sql */ `
        select * from users where users.email = $1
      `,
      [userMail]
    )
  ).rows[0];

  console.log({ user });

  if (!user) {
    user = {
      username: userMail,
      password: crypto.randomBytes(20).toString("hex"),
    };
    console.log({ userMail }, user.password);

    let result = await client.query(
      /* sql */ `
      insert into users (username, email, password_hash) values ($1, $2, $3) returning id
      `,
      [userMail, userMail, await hashPassword(user.password)]
    );

    let userID = result.rows[0].id;
    req.session.user_id = userID;
    res.redirect("/public/profile.html");
    return;
  }

  req.session.user_id = user.id;
  res.redirect("/public/profile.html");
});

//if get the login rest, do something
// loginRouter.get("/login/resetpassword", async (req, res, next) => {
//   try {
//     let code = req.query.code;

//     let result = await client.query(
//       /* sql */ `
//             select * from users where verify_code = $1
//         `,
//       [code]
//     );

//     if (!result.rows) throw new HttpError(400, "your code is not matched");

//     let { password, confirmPassword } = req.body;
//     if (!password) throw new HttpError(400, "missing password");
//     if (!confirmPassword) throw new HttpError(400, "missing ConfirmPassword");

//     if (password !== confirmPassword)
//       throw new HttpError(400, "password not equal to confirm password");

//     result = await client.query(
//       /* sql */ `
//           update users set password_hash = $1
//           `,
//       [await hashPassword(password)]
//     );
//     //change the password
//     res.json({ resetPassword: "success" });
//   } catch (err) {
//     next(err);
//   }
// });

loginRouter.get("/resetpassword/search", async (req, res, next) => {
  try {
    let { email } = req.query;
    let result = await client.query(
      /* sql */ `
            select * from users where users.email = $1
        `,
      [email]
    );

    let user = result.rows[0];
    if (!user) throw new HttpError(401, "This email did not register");
    console.log(user);

    res.json({ message: "check you email" });
    sendResetPasswordMail(String(email));
  } catch (err) {
    next(err);
  }
});

// async function checkUsers(username: string) {
//   let result = await client.query(
//     "SELECT username FROM users WHERE username = $1",
//     [username]
//   );
//   if (result.rows[0].username) {
//     return true;
//   }
//   return false;
// }

// console.log(checkUsers("123"));

loginRouter.post("/resetpassword/confirm?", async (req, res, next) => {
  try {
    let { code, password } = req.body;
    console.log("req.body", req.body);
    console.log("code", code, "password", password);
    if (typeof password !== "string") {
      throw new HttpError(400, "invalid password");
    }
    let result = await client.query(
      /* sql */ `
      update users set password_hash = $1
      where verify_code = $2
        `,
      [await hashPassword(password), code]
    );

    let user = result.rowCount;
    if (user == 0) throw new HttpError(401, "This email did not register");
    console.log(user);

    res.json({ message: "password has been resetted" });
    // sendResetPasswordMail(String(email));
  } catch (err) {
    next(err);
  }
});

loginRouter.get("/sendmail/search", async (req, res, next) => {
  try {
    let { email } = req.query;
    let result = await client.query(
      /* sql */ `
            select * from users where users.email = $1
        `,
      [email]
    );

    let user = result.rows[0];
    if (!user) throw new HttpError(401, "This email did not register");
    console.log(user);

    res.json({ message: "check you email" });
    sendResetPasswordMail(String(email));
  } catch (err) {
    next(err);
  }
});
