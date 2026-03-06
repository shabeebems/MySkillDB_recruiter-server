import nodemailer from 'nodemailer';
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("emailservice");


export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"MySkillDB Support" <noreply@myskilldb.com>',
      to,
      subject,
      html,
    });

    log.info("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    log.error({ err: error }, "Error sending email:");
    throw error;
  }
};

