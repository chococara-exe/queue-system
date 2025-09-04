import { getStoreConnection } from "@/lib/mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { CounterSchema } from "@/models/Counter";
import { CustomerSchema } from "@/models/Customer";
import { getOrCreateConnection } from "@/lib/connectionManager";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        if (!req.body) {
            res.status(400).json({message: "Request body is needed"})
        }

        const {store} = req.body;
        let conn: mongoose.Connection;
        try {
            conn = await getOrCreateConnection(store);
        } catch (error) {
            console.error("Database connection error");
            return res.status(500).json({message: "Error establishing a connection with the database"});
        }

        try {
            const Counter = conn.model("Counter", CounterSchema);
            const Customer = conn.model("Customer", CustomerSchema);

            const counterResult = await Counter.deleteMany({});
            const customerResult = await Customer.deleteMany({});

            console.log(`Deleted ${counterResult.deletedCount} counters`);
            console.log(`Deleted ${customerResult.deletedCount} customers`);

            res.status(200).json({
                message: "All entries deleted from Counters and Customers",
                countersDeleted: counterResult.deletedCount,
                customersDeleted: customerResult.deletedCount
            })
        } catch (error) {
            console.error("Error deleting entries:", error);
            res.status(500).json({message: "Error deleting enties"});
        }

    } else {
        res.status(400).json({message: "Error: method not allowed"})
    }
}