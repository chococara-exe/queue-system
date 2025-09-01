import React, { useState } from "react";

export default function TestWhatsapp() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>("");

    async function handleButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        setLoading(true);
        setResult("");
        
        console.log("Testing WhatsApp...");
        
        try {
            const response = await fetch('/api/whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: "60162103033", // Make sure this number is in your allowed list
                    queueLetter: "A",
                    queueNumber: 1
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log("WhatsApp sent successfully:", data);
                setResult("✅ WhatsApp message sent successfully!");
            } else {
                console.error("WhatsApp failed:", data);
                setResult(`❌ WhatsApp failed: ${data.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = typeof error === "object" && error !== null && "message" in error
                ? (error as { message: string }).message
                : String(error);
            setResult(`❌ Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>WhatsApp Test Page</h1>
            <p>Phone Number: 60162103033</p>
            <p>Queue: A1</p>
            
            <button 
                onClick={handleButton} 
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: loading ? '#ccc' : '#25d366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Sending...' : 'Test WhatsApp'}
            </button>
            
            {result && (
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
                    borderRadius: '5px'
                }}>
                    {result}
                </div>
            )}
        </div>
    );
}