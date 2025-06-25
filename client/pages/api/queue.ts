import { NextApiRequest, NextApiHandler, NextApiResponse } from "next";
import mongoose, { Query } from "mongoose";
import { CounterSchema } from "@/models/Counter";
import { CustomerSchema } from "@/models/Customer";
import { getStoreConnection } from "@/lib/mongoose";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        const {queueLetter, store} = req.query;
        let conn: mongoose.Connection;
        try {
            conn = await getStoreConnection(store as string);
        } catch (err) {
            console.error("Database connection error: ", err);
            return res.status(500).json({message: "Database could not be connected"});
        }

        // check if queue letter is valid
        if (typeof queueLetter !== "string" || !['A', 'B', 'C', 'D'].includes(queueLetter)) {
            return res.status(404).json({message: "Error: invalid queue"});
        }
        const Counter = conn.model("Counter", CounterSchema);
        const queue = await Counter.findOne({name: `curQueue${queueLetter}`});

        // check if queue found and if queue has value
        if (queue && typeof queue.value === "number"){
            res.status(200).json({message: "Current queue number returned", curQueueNumber: queue.value});
        }
        else {
            res.status(200).json({message: "Current queue number returned", curQueueNumber: 0});
        }
    }
    else if (req.method === "POST") {
        const {store} = req.query;
        let conn: mongoose.Connection;
        try {
            conn = await getStoreConnection(store as string);
        } catch (err) {
            console.error("Database connection error: ", err);
            return res.status(500).json({message: "Database could not be connected"});
        }

        const {queueLetter, status} = JSON.parse(req.body);

        // check if queue letter is valid
        if (typeof queueLetter !== "string" || !['A', 'B', 'C', 'D'].includes(queueLetter)) {
            return res.status(404).json({message: "Error: invalid queue"});
        }

        const Counter = conn.model("Counter", CounterSchema);

        // find queue from counter collection in database
        let queue = await Counter.findOne({name: `curQueue${queueLetter}`});

        if (!queue) {
            queue = await Counter.create({name: `curQueue${queueLetter}`, value: 0});
        }

        let queueNumber = (queue.value ?? 0) + 1;
        const Customer = conn.model("Customer", CustomerSchema);
        let customer;
        let attempts = 0;
        let maxAttempts = 100;
        // find the next waiting customer in the queue
        while (attempts < maxAttempts) {
            customer = await Customer.findOne({"queue.letter": queueLetter, "queue.value": queueNumber})

            // return if there are no more waiting customers in the queue
            if (!customer) {
                return res.status(404).json({message: "Next customer could not be found, there are no more waiting customers", curQueueNumber: queue.value});
            }

            // exit queue if next waiting customer found
            if (customer.status === "waiting") break;
            queueNumber++;
            attempts++;
        }

        if (attempts === maxAttempts) {
            return res.status(500).json({message: "Max attempts reached, possible data inconsistency"});
        }

        if (!customer) {
            return res.status(500).json({ message: "Customer not found after max attempts" });
        }

        // update queue counter to most recent customer
        await Counter.updateOne(
            {"_id": queue._id},
            {value: queueNumber},
            {new: true, upsert: true}
        );

        // update customer status
        await Customer.updateOne(
            {"_id": customer._id},
            {status: status}
        )

        res.status(200).json({message: "Current queue number returned", curQueueNumber: queueNumber});
    }
    else {
        res.status(405).json({message: "Method not allowed"});
    }
}