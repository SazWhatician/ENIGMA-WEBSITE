require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

let serviceAccount;

try {
    serviceAccount = require('./firebase-key.json');
    console.log("Using local firebase-key.json");
} catch (err) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount.private_key = serviceAccount.private_key
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '');
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

app.use(express.static(__dirname));

/* ---------------- PROJECT API ---------------- */

app.get('/api/projects', async (req, res) => {
    try {
        const snapshot = await db.collection('projects')
            .orderBy('id')
            .get();

        const projects = snapshot.docs.map(doc => doc.data());

        res.json(projects);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load projects" });
    }
});

/* ---------------- TEAM API ---------------- */

app.get('/api/team', async (req, res) => {
    try {
        const snapshot = await db.collection('team_members')
            .orderBy('id')
            .get();

        const team = snapshot.docs.map(doc => doc.data());

        res.json(team);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load team" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});