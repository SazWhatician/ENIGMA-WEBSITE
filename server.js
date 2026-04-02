require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

// --- FIREBASE INITIALIZATION ---
let serviceAccount;
try {
    const keyPath = path.resolve(__dirname, 'firebase-key.json');
    if (fs.existsSync(keyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        console.log("🔐 Using local firebase-key.json for authentication.");
    } else {
        throw new Error("Local file not found, checking environment...");
    }
} catch (err) {
    // Production (Railway): Handle both plain text JSON and Base64 format
    const envVal = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT;
    if (envVal) {
        try {
            if (envVal.trim().startsWith('{')) {
                serviceAccount = JSON.parse(envVal);
            } else {
                serviceAccount = JSON.parse(Buffer.from(envVal, 'base64').toString('utf8'));
            }
            // Fix private key: replace literal "\n" strings with real newlines
            if (serviceAccount && serviceAccount.private_key) {
                console.log("🔑 Private key first 80 chars (raw):", JSON.stringify(serviceAccount.private_key.substring(0, 80)));
                serviceAccount.private_key = serviceAccount.private_key
                    .replace(/\\r\\n/g, '\n')
                    .replace(/\\r/g, '')
                    .replace(/\\n/g, '\n');
                console.log("🔑 Private key first 80 chars (fixed):", JSON.stringify(serviceAccount.private_key.substring(0, 80)));
            }
            console.log("☁️ Using environment variables for authentication.");
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
app.use(express.static(__dirname));

// --- API ENDPOINTS ---

// Projects Endpoint
app.get('/api/projects', async (req, res) => {
    if (!db) {
        return res.status(500).json({ error: "Database not initialized." });
    }

    try {
        console.log("📦 Fetching project data from Firestore...");
        const snapshot = await db.collection('projects').orderBy('id', 'asc').get();
        const projects = snapshot.docs.map(doc => doc.data());
        res.json(projects);
    } catch (err) {
        console.error("Firestore Error:", err);
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

// Team Endpoint
app.get('/api/team', async (req, res) => {
    if (!db) {
        return res.status(500).json({ error: "Database not initialized." });
    }

    try {
        console.log("👥 Fetching team data from Firestore...");
        const snapshot = await db.collection('team_members').orderBy('id', 'asc').get();
        const team = snapshot.docs.map(doc => doc.data());
        res.json(team);
    } catch (err) {
        console.error("Firestore Error:", err);
        res.status(500).json({ error: "Failed to fetch from database." });
    }
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔌 ENIGMA Server running on http://0.0.0.0:${PORT}`);
});