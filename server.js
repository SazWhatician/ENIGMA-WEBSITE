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

let cachedTeam = null;
let lastTeamFetchTime = 0;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// --- API ENDPOINTS ---

// 1. Projects Endpoint
app.get('/api/projects', async (req, res) => {
    const currentTime = Date.now();

    if (cachedProjects && (currentTime - lastFetchTime < CACHE_DURATION)) {
        console.log("⚡ SPEED BOOST: Serving projects instantly from cache!");
        return res.json(cachedProjects);
    }

    try {
        console.log("🐢 Fetching fresh project data from database...");
        const result = await pool.query('SELECT title, "desc", img, link FROM projects ORDER BY id ASC');
        
        cachedProjects = result.rows;
        lastFetchTime = currentTime;
        
        res.json(cachedProjects);
    } catch (err) {
        console.error("Database Error:", err);
        if (cachedProjects) {
            console.log("⚠️ Database offline. Serving slightly old cache as a fallback.");
            return res.json(cachedProjects);
        }
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

// 2. Team Endpoint (NEW!)
app.get('/api/team', async (req, res) => {
    const currentTime = Date.now();

    if (cachedTeam && (currentTime - lastTeamFetchTime < CACHE_DURATION)) {
        console.log("⚡ SPEED BOOST: Serving team instantly from cache!");
        return res.json(cachedTeam);
    }

    try {
        console.log("🐢 Fetching fresh team data from database...");
        // ADDED 'img' to the SELECT statement right here:
        const result = await pool.query('SELECT name, role, year, insta, linkedin, github, img FROM team_members ORDER BY id ASC');
        
        cachedTeam = result.rows;
        lastTeamFetchTime = currentTime;
        
        res.json(cachedTeam);
    } catch (err) {
        console.error("Database Error:", err);
        if (cachedTeam) {
            console.log("⚠️ Database offline. Serving slightly old cache as a fallback.");
            return res.json(cachedTeam);
        }
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

app.listen(PORT, () => {
    console.log(`ENIGMA Server running on http://localhost:${PORT}`);
});