import jwt from "jsonwebtoken";
import { generateTokens } from "./token.js";
import { getAuthCookieOptions } from "./cookies.js";

const getSecrets = () => {
    const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!accessSecret || !refreshSecret) {
        throw new Error("JWT secret(s) are not configured.");
    }
    return { accessSecret, refreshSecret };
};

export const refreshToken = (req, res) => {
    const tokenFromCookie = req.cookies?.refreshToken;

    if (!tokenFromCookie) {
        return res.status(401).json({ message: "Refresh token is required." });
    }

    try {
        const { refreshSecret } = getSecrets();
        const decoded = jwt.verify(tokenFromCookie, refreshSecret);

        if (decoded?.tokenType !== "refresh") {
            return res.status(403).json({ message: "Invalid refresh token." });
        }

        const payload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        const tokens = generateTokens(payload);

        const cookieOptions = getAuthCookieOptions();

        res.cookie("accessToken", tokens.accessToken, {
            ...cookieOptions,
            maxAge: 40 * 60 * 1000,
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            ...cookieOptions,
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        // Cookie is the source of truth; returning token is optional.
        return res.json({ ok: true });
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired refresh token." });
    }
};

export const logout = (req, res) => {
    try {
        const cookieOptions = getAuthCookieOptions();
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

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

export const getProfile = (req, res) => {
    // authMiddleware already loaded the user and role
    return res.json(req.user);
};
