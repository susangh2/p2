import nodemailer from "nodemailer";
import { env } from "../env";
import crypto from "crypto";
import { client } from "../database/database";

const transporter = nodemailer.createTransport({
  service: "hotmail",
  //   host: "smtp-mail.outlook.com",
  //   port: 587,
  //   secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: env.EMAIL_ADDRESS,
    pass: env.EMAIL_PASSWORD,
  },
});

export async function sendResetPasswordMail(user_email: string) {
  let code = crypto.randomUUID().split("-")[0];

  let href = `http://localhost:${env.PORT}/public/resetpassword.html?code=${code}`;

  await client.query(
    /* sql */ `
     update users set verify_code = $1 where users.email = $2
      `,
    [code, user_email]
  );

  let text = `We received a request to reset your password. If it was you, please enter the verification code: ${code}. If it wasn't you, it is safe to dismiss this message.`;
  let html = `
  <p>We received a request to reset your password.</p>
  <p>If it was you, please input your new password on <a href="${href}">${href}</a></p>
  <p>If it wasn't you, it is safe to dismiss this message</p>
  `;

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `${env.EMAIL_USER}<${env.EMAIL_ADDRESS}>`, // sender address
    to: user_email, // list of receivers
    subject: "Reset Password", // Subject line
    text,
    html,
  });

  console.log(info);
}

// console.log(resetPasswordMail("alice@mailinator.com"));
