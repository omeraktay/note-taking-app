import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true, 
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true
    }
});
  
  // Compare passwords
  userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

const User = mongoose.model('User', userSchema);

export default User;