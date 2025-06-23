import { NextApiRequest, NextApiResponse } from "next";
import Customer from "@/models/Customer";
import mongoose from "mongoose";
import { getStoreConnection } from "@/lib/mongoose";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const {store} = req.query;
        try {
            await getStoreConnection(store as string);
        } catch (err) {
            console.error("Database connection error: ", err);
            res.status(500).json({message: "Database could not be connected"});
        }

        const queue = req.body;

        const customer = await Customer.findOne(
            {"queue.letter": queue.letter, "queue.value": queue.value}
        )
        
        if (!customer) return res.status(404).json({message: "Customer could not be found, please contact staff for more information"});
        if (customer.status !== "waiting") return res.status(201).json({message: "Customer is not currently waiting in queue"});

        await Customer.updateOne(
            {_id: customer._id},
            {status: "cancelled"}
        )
        res.status(200).json({message: "Customer successfully removed from queue"});
    }
    else {
        res.status(405).json({message: "Method not allowed"});
    }
}