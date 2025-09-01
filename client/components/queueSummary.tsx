import { useState, useEffect } from "react";
import { QueueData } from "@/types/queue";
import { fetchAllQueueNumbers } from "@/lib/queueUtils";
import { StorePageProps } from "@/types/pages";

export default function QueueSummary({ store }: StorePageProps) {
    const [queues, setQueues] = useState<QueueData[]>([]);
    const [curQueues, setCurQueues] = useState<QueueData[]>([]);

    function fetchEverything(store: string) {
        fetchAllQueueNumbers(store, "curQueue").then(setCurQueues);
        fetchAllQueueNumbers(store, "queue").then(setQueues);
    }

    useEffect(() => {
        fetchEverything(store);

        const intervalID = setInterval(() => fetchEverything(store), 5000);

        return clearInterval(intervalID);
    }, [])

    return (
        <div className="fixed mt-[-4rem] h-screen">
            {queues.map((queue, idx) => {
                const curQueue = curQueues[idx];
                return (
                    <div className='bg-amber-50 p-4 h-[25vh]' key={queue.queue}>
                        <h2 className=''>Queue {queue.queue}</h2>
                        <p className=''>Current number: <b>{curQueue?.queue}{curQueue?.value}</b></p>
                        <p>Waiting: <b>{queue.value - curQueue?.value}</b></p>
                    </div>
                );
            })}
        </div>
    )
}