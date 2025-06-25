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