import jwt from "jsonwebtoken";
import Student from "../../modules/Students/students.models.js";
import Alumni from "../../modules/Alumini/alumini.models.js";

const getAccessSecret = () => {
    const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!accessSecret) throw new Error("JWT secret is not configured.");
    return accessSecret;
};

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        const decoded = jwt.verify(token, getAccessSecret());

        if (decoded?.tokenType && decoded.tokenType !== "access") {
            return res.status(401).json({ message: "Invalid access token." });
        }
        if (decoded?.role !== "student" && decoded?.role !== "alumni") {
            return res.status(401).json({ message: "Invalid token role." });
        }
        
        let user;
        if (decoded.role === 'student') {
            // Find user and exclude the password field
            user = await Student.findById(decoded.id).select("-password");
        } else if (decoded.role === 'alumni') {
            // Find user and exclude the password field
            user = await Alumni.findById(decoded.id).select("-password");
        }

        if (!user) return res.status(401).json({ message: "Invalid token." });

        // Attach both the decoded token payload and the user document with role for downstream handlers
        req.auth = decoded;
        req.user = {
            ...user.toObject(),
            role: decoded.role,
        };
        next();
    } catch (error) {
        const isExpired = error?.name === "TokenExpiredError";
        return res.status(401).json({ message: isExpired ? "Access token expired." : "Invalid or expired token." });
    }
};