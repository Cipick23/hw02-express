import nodemailer from "nodemailer";
import dotenv from "dotenv";
// import { v4 as uuidv4 } from "uuid";
// import User from "../models/user";

dotenv.config();

const { EMAIL_FROM, EMAIL_PASSWORD } = process.env;

export default async function sendEmailTo(email, token) {
  const nodemailerConfig = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_FROM,
      pass: EMAIL_PASSWORD,
    },
  };
  const host = process.env.HOSTNAME;
  const verificationLink = `${host}/api/users/verify/:verificationToken/verify/${token}`;

  let transporter = nodemailer.createTransport(nodemailerConfig);

  let mailOptions = {
    from: "tzutzuthekid@gmail.com;", // Use the email address or domain you verified above
    to: email,
    subject: "Hello from ContactApp!",
    text: `and easy to do anywhere, even with Node.js`,
    html: `Hello from <strong>ContactApp</strong> <br /><a href="${verificationLink}/api/users/verify/:verificationToken/verify/${token}">${verificationLink}}</a> to validate your account. <br />`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
