import React, {FormEvent, useState} from "react";
import Router, { useRouter } from "next/router";

function JoinForm({store} : {store: string}) {

    const router = useRouter();

    // const formData = useState({
    //     name: "",
    //     contact: "",
    //     adults: "",
    //     children: "",
    //     babies: "",
    //     babychair: "",
    // })
    const [isSubmitting, setSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [adults, setAdults] = useState("");
    const [children, setChildren] = useState("");
    const [babies, setBabies] = useState("");
    const [babychair, setBabychair] = useState("");
    const [contactType, setContactType] = useState("");
    const [contact, setContact] = useState("");
    
    const [showWhatsappInput, setShowWhatsappInput] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setSubmitting(true);
        const customer = {
            name, 
            contact_type: contactType,
            contact, 
            adults: adults === ""? null: Number(adults), 
            children: children === ""? null: Number(children), 
            babies: babies === ""? null: Number(babies), 
            babychair: babychair === ""? null: Number(babychair)
        }
        const response = await fetch(`/api/join?store=${store}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(customer)
        })

        const data = await response.json();
        console.log(data.data);

        if (response.ok && data.queue) {
            router.push(`/queue?store=${store}&query=${encodeURIComponent(JSON.stringify(data.queue))}`);
        }
        
    }

    function handleContactSelection(e: FormEvent) {
        setContact("");
        const selection = (e.target as HTMLInputElement).id;

        if (selection === "whatsapp") {
            setContactType("whatsapp");
            setShowEmailInput(false);
            setShowWhatsappInput(true);
        }
        else if (selection === "email") {
            setContactType("email");
            setShowEmailInput(true);
            setShowWhatsappInput(false);
        }
    }

    return (
        <form id="joinForm" onSubmit={handleSubmit}>
            <label>
                Name 
                <input 
                type="text" 
                value={name} 
                required 
                onChange={(e) => setName(e.target.value)}
                />
            </label>
            <label>
                Number of adults 
                <input 
                type="number" 
                pattern="[0-9]"
                min={1}
                value={adults} 
                required
                onInput={(e) => setAdults((e.target as HTMLInputElement).value)}
                />
            </label>
            <label>
                Number of children (age 4-10)
                <input 
                type="number" 
                pattern="[0-9]"
                min={0}
                value={children} 
                required
                onInput={(e) => setChildren((e.target as HTMLInputElement).value)}
                />
            </label>
            <label>
                Number of children (age less than 4)
                <input 
                type="number" 
                pattern="[0-9]"
                min={0}
                value={babies} 
                required
                onInput={(e) => setBabies((e.target as HTMLInputElement).value)}
                />
            </label>
            <label>
                How many baby chairs do you need?
                <input 
                type="number" 
                pattern="[0-9]"
                min={0}
                value={babychair} 
                required
                onInput={(e) => setBabychair((e.target as HTMLInputElement).value)}
                />
            </label>
            <div>
                <h2>Contact Option</h2>
                <label>
                    Whatsapp 
                    <input 
                    type="radio" 
                    id="whatsapp" 
                    name="contact" 
                    required
                    onInput={handleContactSelection}
                    />
                </label>
                <label>
                    Email 
                    <input 
                    type="radio" 
                    id="email" 
                    name="contact"
                    onInput={handleContactSelection}
                    />
                </label>
                {showWhatsappInput && (
                    <div>
                        <label>
                            Enter Whatsapp number 
                            <input 
                            type="tel" 
                            value={contact}
                            required 
                            onInput={(e) => setContact((e.target as HTMLInputElement).value)}
                            />
                        </label>
                    </div>
                )}
                
                {showEmailInput && (
                    <div>
                        <label>
                            Enter email address 
                            <input 
                            type="email" 
                            value={contact}
                            required
                            onInput={(e) => setContact((e.target as HTMLInputElement).value)}
                            />
                        </label>
                    </div>
                )}
            </div>
            <button type="submit" disabled={isSubmitting}>Submit</button>
            {/* <input type="submit" disabled={isSubmitting}/> */}
        </form>
    )
}

export default JoinForm;