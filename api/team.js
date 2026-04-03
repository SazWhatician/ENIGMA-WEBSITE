const { getDb } = require('./_firebase');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const db = getDb();

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
};
