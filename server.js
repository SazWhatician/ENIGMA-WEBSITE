const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Import Postgres
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.static(__dirname)); 

// Connect to your database
const pool = new Pool({
    connectionString: 'postgresql://postgres:password@localhost:5432/enigma_db'
});

// Your API Endpoint
app.get('/api/projects', async (req, res) => {
    try {
        // Query the database directly!
        const result = await pool.query('SELECT title, "desc", img, link FROM projects ORDER BY id ASC');
        
        // Send the database rows to the frontend
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

app.listen(PORT, () => {
    console.log(`ENIGMA Server running on http://localhost:${PORT}`);
});