import { CustomerData } from "@/types/customer";
import { QueueData } from "@/types/queue";

export async function fetchQueueNumber(store: string, queueLetter: string, queueType: string): Promise<QueueData> {
    try {
        const response = await fetch(`/api/queue?queueLetter=${queueLetter}&store=${store}&queueType=${queueType}`, {
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
            value: data.queueNumber || 0,
            customer: data.customer,
            nextCustomer: data.nextCustomer
        } 
    } catch (error) {
        console.error(`Error fetching current queue number for queue ${queueLetter}:`, error);
        return {
            queue: queueLetter,
            value: -1,
            customer: null,
            nextCustomer: null
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
                queueLetter: queueLetter,
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

export async function fetchAllQueueNumbers(store: string, type: string): Promise<QueueData[]> {
    const queueLetters = ['A', 'B', 'C', 'D'];
    return Promise.all(
        queueLetters.map(letter => fetchQueueNumber(store, letter, type))
    );
}