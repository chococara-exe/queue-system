import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { fetchCurQueueNumber } from "@/lib/queueUtils";

function QueuePage() {
    const router = useRouter();
    const {store, query: queueParam} = router.query;
    const queue = typeof queueParam === "string" ? decodeURIComponent(queueParam) : undefined;
    const [customerAhead, setCustomerAhead] = useState(0);

    useEffect(() => {
        if (!queue || !store) return;

        const queueJSON = JSON.parse(queue);

        async function updateQueueData() {
            try {
                const queueData = await fetchCurQueueNumber(store as string, queueJSON.letter);
                const customersAhead = Math.max(0, queueJSON.value - queueData.value);
                setCustomerAhead(customersAhead);
            } catch (error) {
                console.error("Failed to update queue data:", error)
            }
        }

        updateQueueData();
        
        const intervalID = setInterval(updateQueueData, 5000)

        return () => {
            clearInterval(intervalID);
        }
    }, [queue, store]);

    // console.log(JSON.parse(queue));
    // console.log(typeof queueParam);
    // console.log(typeof queue);

    if (!queue) {
        return(<h1>Error: queue number could not be found</h1>);
    }

    const queueJSON = JSON.parse(queue);

    async function handleCancel(event: React.MouseEvent<HTMLButtonElement>) {
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
            <h2>There are currently {customerAhead} tables in front of you</h2>
            <button onClick={handleCancel}>Cancel Queue</button>
        </div>
    );
}

export default QueuePage;