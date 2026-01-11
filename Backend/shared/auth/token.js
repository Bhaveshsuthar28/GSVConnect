import jwt from "jsonwebtoken";

const getSecrets = () => {
    const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!accessSecret || !refreshSecret) {
        throw new Error("JWT secret(s) are not configured. Set JWT_SECRET (and optionally JWT_ACCESS_SECRET/JWT_REFRESH_SECRET).");
    }
    return { accessSecret, refreshSecret };
};

export const generateTokens = (payload) => ({
    accessToken: (() => {
        const { accessSecret } = getSecrets();
        return jwt.sign({ ...payload, tokenType: "access" }, accessSecret, { expiresIn: "40m" });
    })(),
    refreshToken: (() => {
        const { refreshSecret } = getSecrets();
        return jwt.sign({ ...payload, tokenType: "refresh" }, refreshSecret, { expiresIn: "15d" });
    })(),
});