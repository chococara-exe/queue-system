import { NextApiRequest, NextApiHandler, NextApiResponse } from "next";
import mongoose, { Query } from "mongoose";
import { CounterSchema } from "@/models/Counter";
import { CustomerSchema } from "@/models/Customer";
import { getStoreConnection } from "@/lib/mongoose";
import { callCustomerWhatsapp } from "../../lib/whatsapp";
import { callCustomerEmail } from "../../lib/email";
import { getOrCreateConnection } from "@/lib/connectionManager";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // if (req.method === "GET") {
    //     const {queueLetter, queueType, store} = req.query;
    //     // let conn: mongoose.Connection;
    //     // try {
    //     //     conn = await getStoreConnection(store as string);
    //     // } catch (err) {
    //     //     console.error("Database connection error: ", err);
    //     //     return res.status(500).json({message: "Database could not be connected"});
    //     // }

    //     const conn = await getOrCreateConnection(store as string);

    //     // check if queue letter is valid
    //     if (typeof queueLetter !== "string" || !['A', 'B', 'C', 'D'].includes(queueLetter)) {
    //         return res.status(404).json({message: "Error: invalid queue"});
    //     }
    //     const Counter = conn.model("Counter", CounterSchema);
    //     const queue = await Counter.findOne({name: `${queueType}${queueLetter}`});
    //     // if (queueType === "curQueue") {
    //     //     queue = await Counter.findOne({name: `curQueue${queueLetter}`});
    //     // } else if (queueType === "queue") {
    //     //     queue = await Counter.findOne({name: `queue${queueLetter}`});
    //     // }
    //     console.log(`${queueType}${queueLetter}`);

    //     const Customer = conn.model("Customer", CustomerSchema);

    //     // check if queue found and if queue has value
    //     if (queue && typeof queue.value === "number"){
    //         const customer = await Customer.findOne({"queue.letter": queueLetter, "queue.value": queue.value});
    //         const nextCustomer = await Customer.findOne({"queue.letter": queueLetter, "queue.value": queue.value+1})
    //         res.status(200).json({message: "Current queue number returned", queueNumber: queue.value, customer: customer, nextCustomer: nextCustomer});
    //     }
    //     else {
    //         res.status(200).json({message: "Current queue number returned", queueNumber: 0, customer: null});
    //     }
    //     ;
    // }
    if (req.method === "POST") {
        
        const {store} = req.body;
        // console.log(store);
        // let conn: mongoose.Connection;
        // try {
        //     conn = await getStoreConnection(store as string);
        // } catch (err) {
        //     console.error("Database connection error: ", err);
        //     return res.status(500).json({message: "Database could not be connected"});
        // }

        const conn = await getOrCreateConnection(store as string);

        // console.log("=== DATABASE CONNECTION DEBUG ===");
        // console.log("Database name:", conn.name);
        // console.log("Database host:", conn.host);
        // console.log("Connection string database:", conn.db?.databaseName);

        // // List all databases to see what's available
        // if (conn.db) {
        //     const admin = conn.db.admin();
        //     const dbs = await admin.listDatabases();
        //     console.log("Available databases:", dbs.databases.map(db => db.name));
        // }

        // const {operation, queue} = req.body;
        if (!req.body) return res.status(400).json({message: "Request body is needed"});

        const { operation, queueLetter } = req.body;

        // check if queue letter is valid
        if (typeof queueLetter !== "string" || !['A', 'B', 'C', 'D'].includes(queueLetter)) {
            return res.status(404).json({message: "Error: invalid queue"});
        }

        const Counter = conn.model("Counter", CounterSchema);
        const Customer = conn.model("Customer", CustomerSchema);

        // let rawResult = null;
        // if (conn.db) {
        //     rawResult = await conn.db.collection('counters').findOne({
        //         name: `curQueue${queueLetter}`
        //     });
        // } else {
        //     console.error("Database object is undefined on connection");
        // }
        // console.log("Raw MongoDB result:", rawResult);

        // // find queue from counter collection in database
        let queue = await Counter.findOne({name: `curQueue${queueLetter}`});
        console.log("Queue found:", queue);

        if (!queue) {
            try {
                queue = await Counter.create({name: `curQueue${queueLetter}`, value: 0});
                console.log("New counter created:", queue.name);
            } catch (error) {
                console.error("Error creating new counter:", error);
                return res.status(500).json({message: "Failed to create new counter"})
            }

            if (operation === "update-status") return res.status(400).json({message: "Status change not allowed for customer number 0"});
        }

        let customer;
        if (operation === "update-status") {
            const { status } = req.body;
            customer = await Customer.findOne({"queue.letter": queueLetter, "queue.value": queue.value});

            if (!customer) return res.status(400).json({message: "Customer could not be found"});

            // update customer status
            await Customer.updateOne(
                {"_id": customer._id},
                {status: status}
            )
            
            res.status(200).json({message: "Customer status updated"});
        }
        else if (operation === "call-next-customer") {
            // console.log(`queue: ${queue}`)
            let queueNumber = (queue.value ?? 0) + 1;
            // console.log(queueNumber);
            let attempts = 0;
            let maxAttempts = 50;
            // find the next waiting customer in the queue
            while (attempts < maxAttempts) {
                customer = await Customer.findOne({"queue.letter": queueLetter, "queue.value": queueNumber})
                console.log(customer);

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
                return res.status(400).json({message: "Max attempts reached, possible data inconsistency"});
            }

            if (!customer) {
                return res.status(400).json({ message: "Customer not found after max attempts" });
            }

            // update queue counter to most recent customer
            await Counter.updateOne(
                {"_id": queue._id},
                {value: queueNumber},
                {new: true, upsert: true}
            );

            if (customer.contact_type === "whatsapp" && customer.contact && customer.name) {
                try { 
                    const result = await callCustomerWhatsapp(customer.contact, customer.name, queueLetter, queueNumber);
                    console.log("Notification sent to customer:", result);
                }
                catch (e) { console.error(e) }
            }
            else if (customer.contact_type === "email" && customer.contact && customer.name) {
                try { 
                    const result = await callCustomerEmail(customer.contact, customer.name, queueLetter, queueNumber)
                    console.log("Email sent to customer:", result);
                }
                catch (e) { console.error(e) }
            }

            res.status(200).json({message: "Current queue number returned", curQueueNumber: queueNumber, customer: customer});
        }
        ;
    }
    else {
        res.status(405).json({message: "Method not allowed"});
    }
}