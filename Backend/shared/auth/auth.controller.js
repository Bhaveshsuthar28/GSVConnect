import jwt from "jsonwebtoken";
import { generateTokens } from "./token.js";

export const refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is required." });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        const payload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        const tokens = generateTokens(payload);

        res.json(tokens);
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired refresh token." });
    }
};

export const logout = (req, res) => {
    try {
        // Clear cookies that might have been set during Google auth
        // Options should match those used in res.cookie (excluding maxAge/expires)
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        // Clear passport session if it exists
        if (req.logout) {
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({ message: "Error logging out" });
                }
                // Also destroy session explicitly if needed, but logout() usually handles it.
                // req.session.destroy(); 
                return res.status(200).json({ message: "Logged out successfully" });
            });
        } else {
             return res.status(200).json({ message: "Logged out successfully" });
        }
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Server error during logout" });
    }
};
