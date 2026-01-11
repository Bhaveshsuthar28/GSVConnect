import Otp from "./otp.model.js";
import { transporter } from "../../config/email.config.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_MIN_INTERVAL_MS = 60 * 1000;

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const normalizeOtp = (value) => String(value ?? "").trim();

export const sendOtp = async (email) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
        const err = new Error("Email is required.");
        err.status = 400;
        throw err;
    }

    const existing = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 }).lean();
    if (existing?.createdAt && Date.now() - new Date(existing.createdAt).getTime() < RESEND_MIN_INTERVAL_MS) {
        const err = new Error("Please wait before requesting another OTP.");
        err.status = 429;
        throw err;
    }

    const otp = generateOtp();

    await Otp.deleteMany({ email: normalizedEmail });
    await Otp.create({
        email: normalizedEmail,
        // Stored as plain text (crypto-free) to avoid runtime crypto issues.
        // Field name is kept for backward compatibility with the existing schema.
        otpHash: otp,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Your OTP Verification Code",
        html: `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.4;">
            <p>Your OTP code is:</p>
            <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 8px 0;">${otp}</p>
            <p style="color:#555; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
          </div>
        `,
    });
};

export const verifyOtp = async (email, otp) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const record = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (!record || record.expiresAt < new Date()) return false;

    const providedOtp = normalizeOtp(otp);
    if (!providedOtp || providedOtp !== String(record.otpHash)) return false;

    await Otp.deleteMany({ email: normalizedEmail });
    return true;
};
