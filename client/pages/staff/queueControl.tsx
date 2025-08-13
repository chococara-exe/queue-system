import React, {useEffect, useState} from "react";
import Router, { useRouter } from "next/router";

function Queue({ queue, store }: { queue: string, store: string }) {
    // console.log(queue);
    const router = useRouter();
    const [currentNumber, setCurrentNumber] = useState(0);

    // const response = await fetch(`api/queue?queue=${queue}`)

    useEffect(() => {
        fetch(`api/queue?queueLetter=${queue}&store=${store}`)
        .then((res) => res.json())
        .then((data) => setCurrentNumber(data.curQueueNumber))
        .catch((error) => console.error(error))
    })

    async function updateQueue(event: React.MouseEvent<HTMLButtonElement>) {
        const button = event.currentTarget as HTMLButtonElement;
        const status = button.innerText.toLowerCase();
        console.log(queue);

        const update = {
            queueLetter: queue,
            status: status
        }

        const response  = await fetch(`/api/queue?store=${store}`, {
            method: "POST",
            headers: {"Content-Type": "application/text"},
            body: JSON.stringify(update)
        })

        const data = await response.json();

        if (response.ok) {
            console.log(data.message);
            setCurrentNumber(data.curQueueNumber);

            fetch('/api/queue-update', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    store,
                    queue,
                    ...data
                })
            })
        }
        else {
            console.error(data.message);
            alert(data.message);
        }
    }

    return (
        <div>
            <h1>Queue {queue}</h1>
            <h2>Current number: {currentNumber}</h2>
            <h3>Update status</h3>
            <button value="Completed" onClick={updateQueue}>Completed</button>
            <button value="Absent" onClick={updateQueue}>Absent</button>
            <div>
                <button onClick={() => router.push(`/staff/display/${store}`)}>Open queue display</button>
            </div>
        </div>
    )
}

export default Queue;