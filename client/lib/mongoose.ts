import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const BASE_URL = process.env.BASE_URL;
// const DB = process.env.STAFF_URL;
let isConnected = false;
const connections: Record<string, mongoose.Connection> = {};

export async function getStoreConnection(storeName: string) {
    if (connections[storeName]) {
        return connections[storeName];
    }
    const dbURL = `${BASE_URL}/${storeName}`
    const conn = await mongoose.createConnection(dbURL).asPromise();
    connections[storeName] = conn;
    return conn;
}

async function dbConnect() {
    if (isConnected) return;
    if (!BASE_URL) {
        throw new Error("MONGODB_URL environment variable is not defined");
    }
    mongoose.connect(BASE_URL).then((database) => {
        console.log("Database connected");
        isConnected = database.connections[0].readyState === 1;
        return mongoose;
    })
}

export default dbConnect;