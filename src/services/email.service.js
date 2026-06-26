import { MailtrapTransport } from "mailtrap";
import Nodemailer from "nodemailer";

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

const sender = {
  address: process.env.MAILTRAP_SENDER_EMAIL,
  name: "Medirappel",
};

export async function sendOTPEmail(to, otp) {
  await transport.sendMail({
    from: sender,
    to: [to],
    subject: "Votre code de vérification",
    html: `
      <h2>Bienvenue sur Medirappel !</h2>
      <p>Votre code de vérification est :</p>
      <h1 style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      <p>Ce code expirera dans 10 minutes.</p>
      <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.</p>
    `,
    category: "OTP Verification",
  });
}