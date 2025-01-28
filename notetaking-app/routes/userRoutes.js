import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';

const userRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

// Welcome page
userRouter.get('/welcome', (req, res) => {
    res.render('users/welcome');
});

// Register page
userRouter.get('/register', (req, res) => {
    res.render('users/register');
});

// Login page
userRouter.get('/login', (req, res) => {
    res.render('users/login');
});

// Index page to have all notes
userRouter.get('/index', (req, res) => {
    res.render('notes/index')
});

// Register a new user
userRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existedUser = await User.findOne( { $or:  [{ username }, { email }]});
        if(existedUser){
            return res.status(400).send('Username or email already taken!')
        }
        const hashedPassword = await bcrypt.hash(password, 10); // Hashed version of the password
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        console.log('User registered successfully!');
        res.redirect('login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Registration error!! Please try again.')
    }   
});

// User login
userRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if(!user){
            return res.status(400).send('Invalid username or password!')
        }
        const userMatched = await bcrypt.compare(password, user.password);
        if(!userMatched){
            return res.status(400).send('Invalid username or password!');
        }
        const token = jwt.sign({ id:user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('index');
    } catch (err) {
        console.error(err);
        res.status(500).send('Logging error! Please enter a valid username or password.')
    }
});

// User logout
userRouter.post('/logout', (req, res) => {
    res.clearCookie('toke');
    res.redirect('/users/welcome');
});

export default userRouter;