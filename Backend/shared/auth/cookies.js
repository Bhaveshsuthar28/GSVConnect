export const getAuthCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";

  const requestedSameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  const sameSite = requestedSameSite === "none" ? "none" : requestedSameSite === "strict" ? "strict" : "lax";

  // SameSite=None requires Secure.
  const secure = isProd || sameSite === "none";

  const domain = process.env.COOKIE_DOMAIN || undefined;

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    ...(domain ? { domain } : {}),
  };
};
