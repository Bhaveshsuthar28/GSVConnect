import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
    } catch (error) {
        console.log("Server diabled due to " , error.message)
        process.exit(1)
    }
}