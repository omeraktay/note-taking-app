import express from "express";
import session from "express-session";
import morgan from "morgan";
import path from 'path';
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import serveFavicon from "serve-favicon";
import flash from 'connect-flash';
import passport from "passport";
import { Strategy as Auth0Strategy } from "passport-auth0";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Note from "./models/Note.js";
import User from "./models/User.js";
import noteRouter from "./routes/noteRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import { auth } from 'express-openid-connect'; // Auth0 integration
import pkg from 'express-openid-connect';
const { requiresAuth } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
connectDB();

// Load environment variables
dotenv.config();

// Middleware setup
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(cookieParser());
app.set("trust proxy", true);


// Session setup
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));

// Set the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(serveFavicon(path.join(__dirname, 'public', 'favicon.ico')));

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

app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Auth0 configuration
app.use(auth({
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `http://${process.env.AUTH0_DOMAIN}`,
}));

// Routes
app.use('/notes', requiresAuth(), noteRouter);
app.use('/users', userRouter);

// app.get("/users/index", requiresAuth(), async (req, res) => {
//   try {
//       const notes = await Note.find({ user: req.oidc.user.sub });
//       res.render("index", { user: req.oidc.user, notes });
//   } catch (error) {
//       console.error(error);
//       res.status(500).send("Error retrieving notes.");
//   }
// });


app.get("/profile", requiresAuth(), (req, res) => {
  res.render("profile", { user: req.oidc.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });