import { CustomerData } from "@/types/customer";
import { QueueData } from "@/types/queue";

export async function fetchCurQueueNumber(store: string, queueLetter: string): Promise<QueueData> {
    try {
        const response = await fetch(`/api/queue?queueLetter=${queueLetter}&store=${store}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        })

        const data = await response.json();

        if (!response.ok) {
            console.error("Error fetching queues:", data.message)
            throw new Error(`HTTP error. Status: ${response.status}`)
        };

        return {
            queue: queueLetter,
            value: data.curQueueNumber || 0,
            customer: data.customer
        } 
    } catch (error) {
        console.error(`Error fetching current queue number for queue ${queueLetter}:`, error);
        return {
            queue: queueLetter,
            value: -1,
            customer: null
        }
    }
}

export async function resetQueue(store: string, queueLetter: string) {
    try {
        const response = await fetch("/api/queue", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                store: store,
                queueLetter: queueLetter
            })
        })

        const data = await response.json();
        
        if (!response.ok) {
            console.error(`Error resetting queue ${queueLetter}:`, data.message);
            throw new Error(`HTTP error. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error resetting queue ${queueLetter}:`, error);
    }
}