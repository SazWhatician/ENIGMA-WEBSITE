const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors()); 

// Tells Express to look for index.html right here in the current folder!
app.use(express.static(__dirname)); 

// Your API endpoint
app.get('/api/projects', (req, res) => {
    // FIXED: Now looking for 'project.json' (singular)
    const dbPath = path.join(__dirname, 'project.json'); 
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to load projects." });
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`ENIGMA Server running on http://localhost:${PORT}`);
});