import mongoose from "mongoose";

export default mongoose.model(
  "Alumni",
  new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true },
        phone: String,
        address: String,
        website: String,
        profileImage: String,
        password: { type: String, select: false },
        googleId: String,
        isEmailVerified: Boolean,
        verification: {
            status: {
                type: String,
                enum: ["pending", "verified", "rejected"],
                default: "pending",
            },
            linkedinUrl: String,
            degree: String,
            graduationYear: Number,
            proofUrl: String,
        },
    },
    { timestamps: true }
  )
);
