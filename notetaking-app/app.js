import express from "express"; 
// import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import morgan from "morgan"; 
import path from 'path';
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import serveFavicon from "serve-favicon";
import flash from 'connect-flash';
import passport from "./config/passport.js";
// import { Strategy as Auth0Strategy } from "passport-auth0";
// import { Strategy as LocalStrategy } from "passport-local";
// import bcrypt from 'bcryptjs';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
// import Note from "./models/Note.js";
// import User from "./models/User.js";
import noteRouter from "./routes/noteRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import https from 'https';
import fs from 'fs';
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
// app.use(expressLayouts);
// app.set('layout', 'layout')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(serveFavicon(path.join(__dirname, 'public', 'favicon.ico')));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Session middleware
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
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
}));

// Routes
app.use('/notes', requiresAuth(), noteRouter);
app.use('/users', userRouter);

app.get("/", (req, res) => {
  const message = "Please log in first!"
  if (!req.oidc.isAuthenticated()) {
    return res.redirect("/users/login");
    }
  res.render("users/login", { user: req.oidc.user, message });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost-cert.pem")
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//   });