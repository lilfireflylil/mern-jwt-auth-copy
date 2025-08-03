import resend from "../config/resend.js";
import { EMAIL_SENDER, NODE_ENV } from "../constants/env.js";

type Params = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

function getFromEmail() {
  return NODE_ENV === "development" ? "onboarding@resend.dev" : EMAIL_SENDER;
}

function getToEmail(to: string | string[]) {
  return NODE_ENV === "development" ? "delivered@resend.dev" : to;
}

export async function sendMail({ to, subject, html, text }: Params) {
  return await resend.emails.send({
    from: getFromEmail(),
    to: getToEmail(to),
    subject,
    html,
    text,
  });
}

export default sendMail;
