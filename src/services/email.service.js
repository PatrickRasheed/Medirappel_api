

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

export async function sendVerificationEmail(to, url) {
  await transport.sendMail({
    from: sender,
    to: [to],
    subject: "Confirmez votre adresse e-mail",
    html: `
      <p>Bienvenue ! Cliquez sur le lien ci-dessous pour confirmer votre adresse e-mail :</p>
      <p><a href="${url}">Confirmer mon e-mail</a></p>
    `,
    category: "Email Verification",
  });
}

export async function sendResetPasswordEmail(to, url) {
  await transport.sendMail({
    from: sender,
    to: [to],
    subject: "Réinitialisez votre mot de passe",
    html: `
      <p>Vous avez demandé une réinitialisation de mot de passe.</p>
      <p><a href="${url}">Choisir un nouveau mot de passe</a></p>
    `,
    category: "Password Reset",
  });
}