import jwt from "jsonwebtoken";
import Student from "../../modules/Students/students.models.js";
import Alumni from "../../modules/Alumini/alumini.models.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Authorization token missing. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        let user;
        if (decoded.role === 'student') {
            // Find user and exclude the password field
            user = await Student.findById(decoded.id).select("-password");
        } else if (decoded.role === 'alumni') {
            // Find user and exclude the password field
            user = await Alumni.findById(decoded.id).select("-password");
        }

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};