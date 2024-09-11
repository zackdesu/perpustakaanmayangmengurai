import nodemailer from "nodemailer";
import { throwError } from "./throwError";

const sendEmail = async (
  to: string,
  otp: number,
  subject = "Atur ulang kata sandi",
  text = `Code OTP mu adalah ${otp}`
) => {
  const user = process.env.EMAIL;
  const pass = process.env.PASSWORD;

  if (!user || !pass) return throwError(500, "Email & Password is not found!");

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
  console.log("Message sent successfully!");
};

export default sendEmail;
