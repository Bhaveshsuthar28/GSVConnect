import Otp from "./otp.model.js";
import { transporter } from "../../config/email.config.js";

export const sendOtp = async (email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({
        to: email,
        subject: "OTP Verification",
        html: `<h3>Your OTP: <h2>${otp}<h2></h3>`,
    });
};

export const verifyOtp = async (email, otp) => {
    const record = await Otp.findOne({ email, otp });
    if (!record || record.expiresAt < new Date()) return false;
    await Otp.deleteMany({ email });
    return true;
};
