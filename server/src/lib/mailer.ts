import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.MAIL_FROM || user;

if (!host || !port || !user || !pass || !from) {
  console.warn('SMTP configuration is incomplete. Forgot-password emails will not be sent.');
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
});

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  if (!host || !port || !user || !pass || !from) {
    return;
  }

  await transporter.sendMail({
    from,
    to,
    subject: 'รีเซ็ตรหัสผ่าน PUP',
    text: `คลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ (ลิงก์มีอายุจำกัด):\n${resetLink}`,
    html: `<p>คลิกลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ (ลิงก์มีอายุจำกัด)</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
}
