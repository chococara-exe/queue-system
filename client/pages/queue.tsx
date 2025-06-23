import React from "react";
import { useRouter } from "next/router";

function QueuePage() {
    const router = useRouter();
    const {store, query: queueParam} = router.query;
    const queue = typeof queueParam === "string" ? decodeURIComponent(queueParam) : undefined;
    
    // console.log(JSON.parse(queue));
    // console.log(typeof queueParam);
    // console.log(typeof queue);

    if (!queue) {
        return(<h1>Error: queue number could not be found</h1>);
    }

    const queueJSON = JSON.parse(queue);

    async function handleButton(event: React.MouseEvent<HTMLButtonElement>) {
        const response = await fetch(`/api/cancel?store=${store}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(queueJSON)
        })

        const data = await response.json();

        alert(data.message);
        router.push(`/?store=${store}`);
    }

    return (
        <div>
            <h1>Queue Page</h1>
            <h2>Your queue number is {queueJSON.letter}{queueJSON.value}</h2>
            <button onClick={handleButton}>Cancel Queue</button>
        </div>
    );
}

export default QueuePage;