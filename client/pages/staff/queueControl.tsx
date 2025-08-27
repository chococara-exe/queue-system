import React, {useEffect, useState} from "react";
import { CustomerData } from "@/types/customer";
import { fetchCurQueueNumber } from "@/lib/queueUtils";

function Queue({ queue, store }: { queue: string, store: string }) {
    // console.log(store);
    const [currentNumber, setCurrentNumber] = useState(0);
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);

    // const response = await fetch(`api/queue?queue=${queue}`)

    useEffect(() => {
        async function fetchQueueData() {
            try {
                const queueData = await fetchCurQueueNumber(store, queue);
                
                setCurrentNumber(queueData.value);
                setCustomer(queueData.customer ?? null);
            } catch (error) {
                console.error(`Error fetching current customer data for queue ${queue}:`, error);
            }
        };
        fetchQueueData();
    }, [queue, store])

    async function updateStatus(event: React.MouseEvent<HTMLButtonElement>) {
        if (!customer || !customer.status) {
            alert("No customer status to update");
            return;
        }

        const button = event.currentTarget as HTMLButtonElement;
        const status = button.innerText.toLowerCase();

        try {
            setLoading(true);

            const update = {
                operation: "update-status",
                queueLetter: queue,
                store: store,
                status: status
            }

            const response  = await fetch(`/api/queue?store=${store}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(update)
            })

            const data = await response.json();

            if (!response.ok) {
                console.error(data.message);
                alert(data.message);
            }

            setCustomer(prev => prev ? { ...prev, status: status as "completed" | "absent" } : null);
        } catch (error) {
            console.error("Error in updating customer status:", error);
        } finally {
            setLoading(false);
        }
    }

    async function callNextCustomer(event: React.MouseEvent<HTMLButtonElement>) {
        if (customer?.status === "waiting") {
            alert("Please update customer status before calling the next customer");
            return;
        }
        
        const response = await fetch(`/api/queue`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                operation: "call-next-customer", 
                queueLetter: queue, 
                store: store
            })
        })

        const data = await response.json();

        if (!response.ok) {
            console.error(data.message);
            alert(data.message);
            return;
        }

        console.log(data.message);
        setCurrentNumber(data.curQueueNumber);
        console.log(data.customer);
        setCustomer(data.customer);
    }

    return (
        <div>
            <h1>Queue {queue}</h1>
            <h2>Current number: {currentNumber}</h2>
            <h2>Customer information: </h2>
            {customer ? (
                <div>
                    <p><strong>Name:</strong> {customer.name || 'N/A'}</p>
                    <p><strong>Contact:</strong> {customer.contact || 'N/A'}</p>
                    <p><strong>Adults:</strong> {customer.adults || 0}</p>
                    <p><strong>Children:</strong> {customer.children || 0}</p>
                    <p><strong>Babies:</strong> {customer.babies || 0}</p>
                    <p><strong>Baby Chair:</strong> {customer.babychair || 0}</p>
                    <p><strong>Status:</strong> {customer.status || 'N/A'}</p>
                    <p><strong>ID:</strong> {customer._id || 'N/A'}</p>
                </div>
            ) : (
                <p>Customer information could not be found.</p>
            )}
            <button value="Completed" onClick={updateStatus}>Completed</button>
            <button value="Absent" onClick={updateStatus}>Absent</button>
            <button value="Next" onClick={callNextCustomer}>Call next customer</button>
        </div>
    )
}

export default Queue;