const express = require("express");
const app = express();
const PORT = 8080;
const cors = require("cors");

app.use(cors());
app.use("/api/staff").require("./client/pages/staff.tsx");

app.get("/api/home", (req, res) => {
    res.json({message: "Hello world"});
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})