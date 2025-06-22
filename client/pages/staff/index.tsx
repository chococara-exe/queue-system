import React from "react";
import Queue from "./queueControl";
import StaffLogin from "./login";

function StaffHomepage() {
    return (
        <div>
            <h1>Staff Homepage</h1>
            <StaffLogin/>
            {/* <Queue queue="A"></Queue>
            <Queue queue="B"></Queue> */}
        </div>
    )
}

export default StaffHomepage;