import dotenv from 'dotenv';
dotenv.config(); // <-- indispensable !

import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM || `no-reply@${process.env.DOMAIN || 'e-krini.local'}`;

let transporter;
if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
} else {
  transporter = null;
}
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);

export async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    // transporter not configured; avoid throwing in runtime but log
    // eslint-disable-next-line no-console
    console.warn('SMTP transporter not configured. Skipping sendMail.');
    return { accepted: [] };
  }

  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

export default { sendMail };
