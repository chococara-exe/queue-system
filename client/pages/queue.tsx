import React from "react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { fetchQueueNumber } from "@/lib/queueUtils";

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
                const queueData = await fetchQueueNumber(store as string, queueJSON.letter, "curQueue");
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
        customerAhead !== 0 ? (
            <div>
                <h1>Thank you for waiting.</h1>
                <h2>Here is your queue number</h2>
                <div className="flex bg-blue-700 text-gray-100 rounded-full place-self-center justify-items-center w-40 h-40 m-4 p-auto">
                    <h1 className="m-auto text-6xl!">{queueJSON.letter}{queueJSON.value}</h1>
                </div>
                <h2>There are currently {customerAhead} tables in front of you</h2>
                <h2>We will contact you when we're almost ready to see you.</h2>
                <button className="mt-8!" onClick={handleCancel}>Cancel Queue</button>
            </div>
        ) : (
            <div>
                <h1>Your queue number <b>{queueJSON.letter}{queueJSON.value}</b> has been called.</h1>
                <h1>Please make your way to the store entrance and an employee will guide you to your table.</h1>
            </div>
        )
    );
}

export default QueuePage;