import "dotenv/config";
import { MailtrapTransport } from "mailtrap";
import Nodemailer from "nodemailer";

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

transport
  .sendMail({
    from: { address: process.env.MAILTRAP_SENDER_EMAIL, name: "Test" },
    to: ["bediangrasheed@gmail.com"],
    subject: "Test isolé",
    text: "Ceci est un test",
  })
  .then((res) => console.log(" Succès :", res))
  .catch((err) => console.error(" Erreur :", err));