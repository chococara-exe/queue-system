import React, {useEffect, useState} from "react";
import { CustomerData } from "@/types/customer";
import { fetchQueueNumber } from "@/lib/queueUtils";
import { Button } from "./button";

function Queue({ queue, store }: { queue: string, store: string }) {
    // console.log(store);
    const [currentNumber, setCurrentNumber] = useState(0);
    const [totalNumber, setTotalNumber] = useState(0);
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [nextCustomer, setNextCustomer] = useState<CustomerData | null>(null)

    // const response = await fetch(`api/queue?queue=${queue}`)
    async function fetchQueueData() {
        try {
            const curQueueData = await fetchQueueNumber(store, queue, "curQueue");
            const queueData = await fetchQueueNumber(store, queue, "queue");
            
            setCurrentNumber(curQueueData.value);
            setTotalNumber(queueData.value);
            setCustomer(curQueueData.customer ?? null);
            setNextCustomer(curQueueData.nextCustomer ?? null);
            // console.log("Customer:", customer);
            // console.log("Next Customer:", nextCustomer);
        } catch (error) {
            console.error(`Error fetching current customer data for queue ${queue}:`, error);
        }
    };

    useEffect(() => {

        fetchQueueData();

        const intervalID = setInterval(() => fetchQueueData(), 5000);

        return () => clearInterval(intervalID);
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
        setNextCustomer(data.nextCustomer);
    }

    return (
        <div className="bg-amber-50 m-4 w-100 md:w-160 p-8 space-y-3">
            <h1>Queue {queue}</h1>
            <h2>Current number: {currentNumber}</h2>
            <h2>Waiting: {totalNumber-currentNumber}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 space-x-5">
                {customer ? (
                    <div>
                        <h2>Current customer information: </h2>
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
                    <p>Current customer information could not be found.</p>
                )}
                {nextCustomer ? (
                    <div>
                        <h2>Next customer information: </h2>
                        <p><strong>Name:</strong> {nextCustomer.name || 'N/A'}</p>
                        <p><strong>Contact:</strong> {nextCustomer.contact || 'N/A'}</p>
                        <p><strong>Adults:</strong> {nextCustomer.adults || 0}</p>
                        <p><strong>Children:</strong> {nextCustomer.children || 0}</p>
                        <p><strong>Babies:</strong> {nextCustomer.babies || 0}</p>
                        <p><strong>Baby Chair:</strong> {nextCustomer.babychair || 0}</p>
                        <p><strong>Status:</strong> {nextCustomer.status || 'N/A'}</p>
                        <p><strong>ID:</strong> {nextCustomer._id || 'N/A'}</p>
                    </div>
                ) : (
                    <p>Next customer information could not be found.</p>
                )}
            </div>
            <div className="grid place-content-center">
                <Button name="Completed" value="Completed" onClick={updateStatus} className="bg-green-300" />
                <Button name="Absent" value="Absent" onClick={updateStatus} className="bg-red-300" />
                <Button name="Call Next Customer" value="Next" onClick={callNextCustomer} className="bg-blue-300" />
            </div>
        </div>
    )
}

export default Queue;