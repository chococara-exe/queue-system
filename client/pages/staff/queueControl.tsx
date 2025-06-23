import React, {useEffect, useState} from "react";

function Queue({ queue, store }: { queue: string, store: string }) {
    // console.log(queue);
    const [currentNumber, setCurrentNumber] = useState(0);

    // const response = await fetch(`api/queue?queue=${queue}`)

    useEffect(() => {
        fetch(`api/queue?queueLetter=${queue}&store=${store}`)
        .then((res) => res.json())
        .then((data) => setCurrentNumber(data.curQueueNumber))
        .catch((error) => console.error(error))
    })

    async function handleButton(event: React.MouseEvent<HTMLButtonElement>) {
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
            <button value="Completed" onClick={handleButton}>Completed</button>
            <button value="Absent" onClick={handleButton}>Absent</button>
        </div>
    )
}

export default Queue;