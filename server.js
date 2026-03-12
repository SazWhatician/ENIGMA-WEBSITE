require('dotenv').config(); // Make sure this is at the very top!
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.static(__dirname)); 

// Connect to your database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
});

// --- CACHING LOGIC ---
let cachedProjects = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Your API Endpoint
app.get('/api/projects', async (req, res) => {
    const currentTime = Date.now();

    // 1. Check if we have fresh data saved in RAM
    if (cachedProjects && (currentTime - lastFetchTime < CACHE_DURATION)) {
        console.log("⚡ SPEED BOOST: Serving projects instantly from cache!");
        return res.json(cachedProjects);
    }

    // 2. If the cache is empty or older than 5 minutes, wake up Supabase
    try {
        console.log("🐢 Fetching fresh data from Supabase...");
        const result = await pool.query('SELECT title, "desc", img, link FROM projects ORDER BY id ASC');
        
        // 3. Save the new data into the cache for the next user
        cachedProjects = result.rows;
        lastFetchTime = currentTime;
        
        res.json(cachedProjects);
    } catch (err) {
        console.error("Database Error:", err);
        
        // 4. Fallback: If Supabase crashes but we have old cached data, send that!
        if (cachedProjects) {
            console.log("⚠️ Database offline. Serving slightly old cache as a fallback.");
            return res.json(cachedProjects);
        }
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

app.listen(PORT, () => {
    console.log(`ENIGMA Server running on http://localhost:${PORT}`);
});