import jwt from "jsonwebtoken";

export const generateTokens = (payload) => ({
    accessToken: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40m" }),
    refreshToken: jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "15d",
    }),
});