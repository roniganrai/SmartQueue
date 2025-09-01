import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === "465", // SSL if port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Smart Queue" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to} | Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw err;
  }
};
