import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "Alumni", required: true },
    authorName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
