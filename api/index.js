require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// --- BULLETPROOF FIREBASE INITIALIZATION ---
let serviceAccount;
try {
    // 1. Local Dev: Try to use the raw JSON file (Bypasses all .env errors!)
    serviceAccount = require('../firebase-key.json');
    console.log("🔐 Using local firebase-key.json for authentication.");
} catch (err) {
    // 2. Production (Vercel/Railway): Decode from Base64 env var
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (base64) {
        serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
        console.log("☁️ Using Vercel Edge environment variables for authentication.");
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
