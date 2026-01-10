import mongoose from "mongoose";

export default mongoose.model(
    "Student",
    new mongoose.Schema(
        {
        name: String,
        email: { type: String, unique: true },
        password: { type: String, select: false },
        isEmailVerified: { type: Boolean, default: false },
        branch: String,
        year: Number,
        },
        { timestamps: true }
    )
);
