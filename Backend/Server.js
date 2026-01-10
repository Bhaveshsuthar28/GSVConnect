import { connectDB } from "./config/db.config.js";
import dotenv from "dotenv"
import { app } from "./app.js";

dotenv.config()

connectDB();

app.listen(process.env.PORT || 2804 , () => {
    console.log("Server running on port no : " , process.env.PORT || 2804)
})