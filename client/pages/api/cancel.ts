import { NextApiRequest, NextApiResponse } from "next";
import Customer from "@/models/Customer";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        try {
            await dbConnect();
        } catch (err) {
            console.error("Database connection error: ", err);
            res.status(500).json({message: "Database could not be connected"});
        }

        const queue = req.body;

        const customer = await Customer.findOneAndUpdate(
            {"queue.letter": queue.letter, "queue.value": queue.value},
            {status: "cancelled"},
            {new: true, upsert: true}
        )
        
        if (!customer) return res.status(404).json({message: "Customer could not be found, please contact staff for more information"});
        if (customer.status !== "waiting") return res.status(201).json({message: "Customer is not currently waiting in queue"});
        res.status(200).json({message: "Customer successfully removed from queue"});
    }
    else {
        res.status(405).json({message: "Method not allowed"});
    }
}