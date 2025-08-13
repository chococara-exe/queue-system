import React, {useState, useEffect} from 'react';

interface QueueDisplayProps {
    store: string;
}

interface QueueData {
    queue: string;
    currentNumber: number;
}

export default function QueueDisplay({ store }: QueueDisplayProps) {
    const [queues, setQueues] = useState<QueueData[]>([]);

    async function fetchQueueNumber(store: string) {
        const queueLetters = ['A', 'B', 'C', 'D'];
        Promise.all(
            queueLetters.map(letter =>
            fetch(`/api/queue?queueLetter=${letter}&store=${store}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => res.json())
                .then(data => ({
                queue: letter,
                currentNumber: data.curQueueNumber,
                }))
                .catch(err => ({
                queue: letter,
                currentNumber: -1,
                }))
            )
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
        fetchQueueNumber(store);

        const intervalID = setInterval(() => fetchQueueNumber(store), 5000);

        return () => clearInterval(intervalID);
    }, []);
    
    return (
        <div className="queue-display">
            {queues.map(queue => (
                <div key={queue.queue}>
                    <h2>Queue {queue.queue}</h2>
                    <div className='current-number'>Now Serving: {queue.currentNumber}</div>
                </div>
            ))}
        </div>
    );
}