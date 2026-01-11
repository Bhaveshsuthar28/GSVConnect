import { connectDB } from "./config/db.config.js";
import { app } from "./app.js";

const port = Number(process.env.PORT || 2804);

await connectDB();

app.listen(port, () => {
    console.log("Server running on port no : ", port);
});