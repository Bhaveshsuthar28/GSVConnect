import mongoose from "mongoose";

export default mongoose.model(
    "Student",
    new mongoose.Schema(
        {
        name: String,
        email: { type: String, unique: true },
        password: { type: String, select: false },
        googleId: String,
        isEmailVerified: { type: Boolean, default: false },
        branch: String,
        year: Number,
        degree: String,
        cgpa: Number,
        phone: String,
        address: String,
        portfolioUrl: String,
        linkedinId: String,
        profileImage: String,
        skills: {
            type: [String],
            default: [],
        },
        },
        { timestamps: true }
    )
);
