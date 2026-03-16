require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

// --- BULLETPROOF FIREBASE INITIALIZATION ---
let serviceAccount;
try {
    // 1. Local Dev: Try to use the raw JSON file (Bypasses all .env errors!)
    serviceAccount = require('./firebase-key.json');
    console.log("🔐 Using local firebase-key.json for authentication.");
} catch (err) {
    // 2. Production (Railway): Fallback to the .env string if the file isn't there
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    // Fix the escaped newlines from the .env string
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/\\r/g, '');
    console.log("☁️ Using Railway environment variables for authentication.");
}

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.static(__dirname)); 

// --- CACHING LOGIC ---
let cachedProjects = null;
let lastFetchTime = 0;

let cachedTeam = null;
let lastTeamFetchTime = 0;

const CACHE_DURATION = 5 * 60 * 1000;

// --- API ENDPOINTS ---

// 1. Projects Endpoint
app.get('/api/projects', async (req, res) => {
    const currentTime = Date.now();

    if (cachedProjects && (currentTime - lastFetchTime < CACHE_DURATION)) {
        console.log("⚡ SPEED BOOST: Serving projects instantly from cache!");
        return res.json(cachedProjects);
    }

    try {
        console.log("🐢 Fetching fresh project data from Firestore...");
        const snapshot = await db.collection('projects').orderBy('id', 'asc').get();
        
        cachedProjects = snapshot.docs.map(doc => doc.data());
        lastFetchTime = currentTime;
        
        res.json(cachedProjects);
    } catch (err) {
        console.error("Firestore Error:", err);
        if (cachedProjects) {
            console.log("⚠️ Database offline. Serving slightly old cache as a fallback.");
            return res.json(cachedProjects);
        }
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

// 2. Team Endpoint
app.get('/api/team', async (req, res) => {
    const currentTime = Date.now();

    if (cachedTeam && (currentTime - lastTeamFetchTime < CACHE_DURATION)) {
        console.log("⚡ SPEED BOOST: Serving team instantly from cache!");
        return res.json(cachedTeam);
    }

    try {
        console.log("🐢 Fetching fresh team data from Firestore...");
        const snapshot = await db.collection('team_members').orderBy('id', 'asc').get();
        
        cachedTeam = snapshot.docs.map(doc => doc.data());
        lastTeamFetchTime = currentTime;
        
        res.json(cachedTeam);
    } catch (err) {
        console.error("Firestore Error:", err);
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