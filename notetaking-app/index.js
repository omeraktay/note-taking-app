import express from "express";
import session from "express-session";
import morgan from "morgan";
import path from 'path';
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import serveFavicon from "serve-favicon";
import flash from 'connect-flash';
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import noteRouter from "./routes/noteRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
dotenv.config();

app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(serveFavicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/', noteRouter);

passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user){
         return done(null, false, { message: 'Invalid credentials.\n' });
    }
    return done(null, user);
 }));










app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });