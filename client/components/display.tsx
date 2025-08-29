import React, {useState, useEffect} from 'react';
import { QueueData } from '@/types/queue';
import { fetchCurQueueNumber } from '@/lib/queueUtils';

interface QueueDisplayProps {
    store: string;
}

export default function QueueDisplay({ store }: QueueDisplayProps) {
    const [queues, setQueues] = useState<QueueData[]>([]);

    async function fetchQueueNumbers(store: string) {
        const queueLetters = ['A', 'B', 'C', 'D'];
        Promise.all(
            queueLetters.map(letter => fetchCurQueueNumber(store, letter))
        ).then(setQueues);
    }

    useEffect(() => {
        // const ws = new WebSocket(`ws://localhost:3001/${store}`);

        // ws.onmessage = (event) => {
        //     const updatedQueue = JSON.parse(event.data);
        //     setQueues(prev =>
        //         prev.map(q =>
        //             q.queue === updatedQueue.queue ? { ...q, ...updatedQueue} : q
        //         )
        //     );
        // };

        // fetch(`/api/queues/${store}`)
        //     .then(res => res.json())
        //     .then(data => setQueues(data));
        
        // return () => ws.close();
        fetchQueueNumbers(store);

        const intervalID = setInterval(() => fetchQueueNumbers(store), 5000);

        return () => clearInterval(intervalID);
    }, []);
    
    return (
        <div className="grid grid-cols-2 place-content-center gap-3 w-[100%] h-[100%]">
            {queues.map(queue => (
                <div className='bg-amber-50 p-10 h-auto' key={queue.queue}>
                    <h2 className='text-3xl'>Queue {queue.queue}</h2>
                    <div className='m-4 text-2xl'>Now Serving: <b>{queue.queue}{queue.value}</b></div>
                </div>
            ))}
        </div>
    );
}