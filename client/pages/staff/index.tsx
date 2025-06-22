import React from "react";
import Queue from "./queueControl";

function StaffHomepage() {
    return (
        <div>
            <h1>Staff Homepage</h1>
            <Queue queue="A"></Queue>
            <Queue queue="B"></Queue>
        </div>
    )
}

export default StaffHomepage;