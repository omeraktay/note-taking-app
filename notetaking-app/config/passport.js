import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as Auth0Strategy } from "passport-auth0";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Local Strategy
passport.use(
    new LocalStrategy(
      { usernameField: "email" }, // Use email instead of username if needed
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            console.log("User not found");
            return done(null, false, { message: "User not found" })
          };
          console.log("Entered Password:", password);
          console.log("Stored Hashed Password:", user.password);
  
          const isMatch = await bcrypt.compare(password, user.password);
          console.log("Password Match:", isMatch);
  
          if (!isMatch) {
            console.log("Incorrect password!!!");
            return done(null, false, { message: "Incorrect password!!" })
          };
  
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  passport.use(new Auth0Strategy(
      {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL,
      },
      (accessToken, refreshToken, extraParams, profile, done) => {
        return done(null, profile); // Pass user profile to session
      }
    )
  );
  // Serialize and deserialize user information
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
      try {
          const user = await User.findById(id);
          done(null, user);
      } catch (error) {
          done(error);
      }
  });
  
export default passport;
