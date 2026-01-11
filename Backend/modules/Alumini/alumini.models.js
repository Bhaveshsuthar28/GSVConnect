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
        portfolioUrl: String,
        companyName: String,
        profileImage: String,
        skills: {
          type: [String],
          default: [],
        },
        password: { type: String, select: false },
        googleId: String,
        isEmailVerified: { type: Boolean, default: false },
        verification: {
            status: {
                type: String,
                enum: ["pending", "verified", "rejected"],
                default: "pending",
            },
            linkedinUrl: String,
          linkedinId: String,
            degree: String,
            graduationYear: Number,
            proofUrl: String,
        },
    },
    { timestamps: true }
  )
);
