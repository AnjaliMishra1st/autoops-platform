const express = require("express");

const app = express();
const PORT = 5000;

app.get("/health", (req, res) => {
    res.send("AutoOps backend running");
});

app.listen(PORT, () => {
    console.log(`AutoOps server started on port ${PORT}`);
});
