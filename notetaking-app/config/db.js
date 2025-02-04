import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/NoteTakingApp', {
            useNewUrlParser: true,
    });
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error connecting database: ${err}`);
        process.exit(1);
    }
};

export default connectDB;