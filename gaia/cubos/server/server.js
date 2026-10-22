const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Allow CORS (for frontend-backend communication)
app.use(cors());

// Serve the React build folder
app.use(express.static(path.join(__dirname, "build")));

// API Route for Cubo JSON
app.get("/cubos/react/curriculum/:view", (req, res) => {
    const { view } = req.params;
    res.json({
        title: `Cubo Example - ${view}`,
        content: "Generated JSON",
        html: `<div id="root">hello world!!</div>`
    });
});

// Serve React App for all other routes (SPA support)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});