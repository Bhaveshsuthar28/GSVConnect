import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { googleLogin } from "../modules/Alumini/alumini.controller.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/v1/alumni/google/callback",
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { alumni, tokens } = await googleLogin(profile);
                done(null, { alumni, tokens });
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.serializeUser((data, done) => {
    done(null, data);
});

passport.deserializeUser((data, done) => {
    done(null, data);
});
