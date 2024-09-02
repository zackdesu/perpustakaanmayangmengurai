import nodemailer from "nodemailer";
import { throwError } from "./throwError";

const sendEmail = async (
  email: string,
  otp: number,
  subject = "Atur ulang kata sandi"
) => {
  try {
    const user = process.env.EMAIL;
    const pass = process.env.PASSWORD;

    if (!user || !pass)
      return throwError(500, "Email & Password is not found!");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `Perpustakaan Mayang Mengurai <${user}>`,
      to: email,
      subject,
      text: `Code OTP mu adalah ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Message sent successfully!");
  } catch (error) {
    console.log(error);
  }
};

export default sendEmail;
