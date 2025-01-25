import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [5, 'Username must be at between 5 to 12 characters long!'],
        maxlength: [12, 'Username must be at between 5 to 12 characters long!']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long!']
    }
});

const User = mongoose.model('User', userSchema);

export default User;