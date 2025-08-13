import React, {useState} from "react";
import Queue from "./queueControl";
import StaffLogin from "./login";

function StaffHomepage() {
    const [store, setStore] = useState("10gramTrial");

    return (
        <div>
            <h1>Staff Homepage</h1>
            <label>Choose store:</label>
            <select 
            name="store" 
            value={store}
            onChange={(e) => setStore(e.target.value)}
            >
                <option value="10gramTrial">10 Gram Trial</option>
                <option value="10PotsTamarind">10 Pots Tamarind</option>
                <option value="10PotsAeon">10 Pots Aeon</option>
            </select>
            <StaffLogin store={store}/>
        </div>
    )
}

export default StaffHomepage;