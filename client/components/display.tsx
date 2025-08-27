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
        <div className="queue-display">
            {queues.map(queue => (
                <div key={queue.queue}>
                    <h2>Queue {queue.queue}</h2>
                    <div className='current-number'>Now Serving: {queue.value}</div>
                </div>
            ))}
        </div>
    );
}