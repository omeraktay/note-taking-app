import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import passport from "passport";

const userRouter = express.Router();

// Render Registration Page
userRouter.get("/register", (req, res) => {
    res.render("register", { message: req.flash("error") });
});

// Handle Registration
userRouter.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        req.flash("error", "All fields are required.");
        return res.redirect("/users/register");
    }
    try {
        let user = await User.findOne({ email });
        if (user) {
            req.flash("error", "User already exists.");
            return res.redirect("/users/register");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password Before Saving:", hashedPassword);
        user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.redirect("/users/login");
    } 
    catch (error) {
        console.error("Registration Error:", error);
        req.flash("error", "Server error. Please try again!");
        res.redirect("/users/register");
    }
});

// Render Login Page
userRouter.get("/login", (req, res) => {
    res.render("users/login", { message: req.flash("error") });
});
  
// Handle Login
userRouter.post("/login", async (req, res, next) => {
    passport.authenticate("local", async (err, user) => {
        if (err) {
            req.flash("error", "Server error!!!");
            return res.redirect("/users/login");
        }
        if (!user) {
            req.flash("error", "Invalid email or password!!!");
            return res.redirect("/users/login");
        }

        req.logIn(user, (err) => {
            if (err) {
                req.flash("error", "Login failed.");
                return res.redirect("/users/login");
            }
            return res.redirect("/users/profile");
        });
    })(req, res, next);
});

const requiresAuthMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next(); // User is logged in via passport-local
    } else if (req.oidc?.isAuthenticated()) {
      return next(); // User is logged in via Auth0
    } else {
      res.redirect("/login"); // Redirect to login if neither authentication method is used
    }
  };

  userRouter.get("/profile", requiresAuthMiddleware, (req, res) => {
    if (req.oidc?.isAuthenticated()) {
      res.render("profile", { user: req.oidc.user }); // Pass Auth0 user data
    } 
    else if (req.isAuthenticated()) {
      res.render("profile", { user: req.user }); // Pass local user data
    } 
    else {
      res.redirect("/login"); // Fallback just in case
    }
  });

// Logout Route
userRouter.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/users/login");
    });
});

export default userRouter;
