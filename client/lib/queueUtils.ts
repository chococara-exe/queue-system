import { CustomerData } from "@/types/customer";
import { QueueData } from "@/types/queue";

export async function fetchQueueNumber(store: string, queueLetter: string): Promise<QueueData> {
    try {
        const response = await fetch(`/api/cache/queue-data?store=${store}`)
        const data = await response.json();

        if (!response.ok) {
            // console.error("Error fetching queues:", data.message)
            throw new Error(`HTTP error. Status: ${response.status}`)
        };

        console.log(data);

        const index = ["A", "B", "C", "D"].findIndex(letter => letter === queueLetter);

        return data.queues[index];
    } catch (error) {
        console.error(`Error fetching queue data for queue ${queueLetter}:`, error);
        return {
            letter: queueLetter,
            currentNumber: -1,
            totalNumber: -1,
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

// export async function fetchAllQueueNumbers(store: string, type: string): Promise<QueueData[]> {
//     const queueLetters = ['A', 'B', 'C', 'D'];
//     return Promise.all(
//         queueLetters.map(letter => fetchQueueNumber(store, letter, type))
//     );
// }

export async function fetchAllQueueNumbers(store: string): Promise<QueueData[]> {
    try {
        const response = await fetch(`/api/cache/queue-data?store=${store}`)
        const data = await response.json();

        if (!response.ok) {
            // console.error("Error fetching queues:", data.message)
            throw new Error(`HTTP error. Status: ${response.status}`)
        };

        return data.queues;
    } catch (error) {
        console.error(`Error fetching all queue data:`, error);
        return [];
    }
}