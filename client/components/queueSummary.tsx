import { useState, useEffect } from "react";
import { QueueData } from "@/types/queue";
import { fetchAllQueueNumbers } from "@/lib/queueUtils";
import { StorePageProps } from "@/types/pages";

export default function QueueSummary({ store }: StorePageProps) {
    const [queues, setQueues] = useState<QueueData[]>([]);
    // const [curQueues, setCurQueues] = useState<QueueData[]>([]);

    // function fetchEverything(store: string) {
    //     fetchAllQueueNumbers(store, "curQueue").then(setCurQueues);
    //     fetchAllQueueNumbers(store, "queue").then(setQueues);
    // }

    useEffect(() => {
        fetchAllQueueNumbers(store).then(setQueues);

        const intervalID = setInterval(() => fetchAllQueueNumbers(store).then(setQueues), 5000);

        return clearInterval(intervalID);
    }, [])

    return (
        <div className="fixed mt-[-4rem] h-screen">
            {queues ? queues.map(queue => {
                return (
                    <div className='bg-amber-50 p-4 h-[25vh]' key={queue.letter}>
                        <h2 className=''>Queue {queue.letter}</h2>
                        <p className=''>Current number: <b>{queue.letter}{queue.currentNumber}</b></p>
                        <p>Waiting: <b>{queue.totalNumber - queue.currentNumber}</b></p>
                    </div>
                );
            }) : <div>Unable to get queue data</div>}
        </div>
    )
}