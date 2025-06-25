import type { NextApiRequest, NextApiResponse } from "next";
import { getStoreConnection } from "@/lib/mongoose";
import mongoose from "mongoose";
import {CustomerSchema} from "@/models/Customer";
import {CounterSchema} from "@/models/Counter";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    const {store} = req.query;
    if (req.method == "POST") {
        let conn: mongoose.Connection;
        try {
            conn = await getStoreConnection(store as string);
        } catch (err) {
            console.error("Database connection error: ", err);
            return res.status(500).json({message: "Database could not be connected"});
        }

        const {name, contact, adults, children, babies, babychair} = req.body;
        const Counter = conn.model("Counter", CounterSchema);

        const totalPax = adults + children + babies;
        let queue, queueLetter;
        if (totalPax <= 2) {
            queue = await Counter.findOneAndUpdate(
                {name: "queueA"},
                {$inc: {value: 1}},
                {new: true, upsert: true}
            )
            queueLetter = "A";
        }
        else if (totalPax <= 4) {
            queue = await Counter.findOneAndUpdate(
                {name: "queueB"},
                {$inc: {value: 1}},
                {new: true, upsert: true}
            )
            queueLetter = "B";
        }
        else if (totalPax <= 9) {
            queue = await Counter.findOneAndUpdate(
                {name: "queueC"},
                {$inc: {value: 1}},
                {new: true, upsert: true}
            )
            queueLetter = "C";
        }
        else {
            queue = await Counter.findOneAndUpdate(
                {name: "queueD"},
                {$inc: {value: 1}},
                {new: true, upsert: true}
            )
            queueLetter = "D";
        }

        const queueNumber = {letter: queueLetter, value: queue.value};
        // console.log(queueNumber);

        const Customer = conn.model("Customer", CustomerSchema);
        const customer = await Customer.create({
            name, 
            queue: queueNumber, 
            contact, 
            adults, 
            children, 
            babies, 
            babychair
        });
        res.status(200).json({message: "Customer added", data: customer, queue: queueNumber});
    }
    else {
        res.status(405).json({message: "Method not allowed"});
    }
}