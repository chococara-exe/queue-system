import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const DB = process.env.MONGODB_URL;
let isConnected = false;

async function dbConnect() {
    if (isConnected) return;
    if (!DB) {
        throw new Error("MONGODB_URL environment variable is not defined");
    }
    mongoose.connect(DB).then((database) => {
        console.log("Database connected");
        isConnected = database.connections[0].readyState === 1;
        return mongoose;
    })
}

export default dbConnect;