import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    name: { type: String, required: true },
    fileName: { type: String },
    resumeUrl: { type: String },
  },
  { _id: false, timestamps: true }
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    openings: { type: Number, required: true, min: 1 },
    skills: [{ type: String, trim: true }],
    package: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Alumni", required: true },
    postedByName: { type: String, required: true },
    postedByAvatar: { type: String },
    applicants: [applicantSchema],
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
export default Job;
