require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- BULLETPROOF FIREBASE INITIALIZATION ---
let serviceAccount;
try {
    // 1. Local Dev: Try to use the raw JSON file using dynamic resolution (Bypasses Vercel build compilation crashes)
    const keyPath = path.resolve(__dirname, '../firebase-key.json');
    if (fs.existsSync(keyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        console.log("🔐 Using local firebase-key.json for authentication.");
    } else {
        throw new Error("Local file not found, checking environment...");
    }
} catch (err) {
    // 2. Production (Vercel/Railway): Handle both plain text JSON and Base64 format
    const envVal = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (envVal) {
        try {
            // Check if it's base64 (usually lacks curly braces)
            if (envVal.trim().startsWith('{')) {
                serviceAccount = JSON.parse(envVal);
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/\\r/g, '');
                }
            } else {
                serviceAccount = JSON.parse(Buffer.from(envVal, 'base64').toString('utf8'));
            }
            console.log("☁️ Using Vercel environment variables for authentication.");
        } catch (parseError) {
            console.error("❌ CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT variable.");
        }
    } else {
        console.error("❌ CRITICAL: No FIREBASE_SERVICE_ACCOUNT found in ENV!");
    }
}

if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.apps.length ? admin.firestore() : null;
const app = express();

app.use(cors());

// --- VERCEL OPTIMIZED ENDPOINTS ---

// 1. Projects Endpoint
app.get('/api/projects', async (req, res) => {
    // Vercel Edge Cache: serve stale instantly while fetching fresh in background, cache for 5 minutes (300s)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    
    if (!db) {
        return res.status(500).json({ error: "Database not initialized natively." });
    }

    try {
        console.log("🐢 Fetching fresh project data from Firestore...");
        const snapshot = await db.collection('projects').orderBy('id', 'asc').get();
        const projects = snapshot.docs.map(doc => doc.data());
        res.json(projects);
    } catch (err) {
        console.error("Firestore Error:", err);
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

// 2. Team Endpoint
app.get('/api/team', async (req, res) => {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');

    if (!db) {
        return res.status(500).json({ error: "Database not initialized natively." });
    }

    try {
        console.log("🐢 Fetching fresh team data from Firestore...");
        const snapshot = await db.collection('team_members').orderBy('id', 'asc').get();
        const team = snapshot.docs.map(doc => doc.data());
        res.json(team);
    } catch (err) {
        console.error("Firestore Error:", err);
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

// EXPORT APP FOR VERCEL SERVERLESS
module.exports = app;
