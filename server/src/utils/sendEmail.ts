import nodemailer from "nodemailer";
import HttpError from "./HttpError";
import logger from "./logger";

const sendEmail = async (
  to: string,
  otp: number,
  subject = "Atur ulang kata sandi",
  text = `Code OTP mu adalah ${otp}`
) => {
  const user = process.env.EMAIL;
  const pass = process.env.PASSWORD;

  if (!user || !pass)
    throw new HttpError(500, "Email & Password is not found!");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `Perpustakaan Mayang Mengurai <${user}>`,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
  logger.info("Message sent successfully!");
};

export default sendEmail;
