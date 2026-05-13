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
        console.log("📦 Fetching project data from Firestore...");
        const snapshot = await db.collection('projects').orderBy('id', 'asc').get();
        
        if (snapshot.empty) {
            console.warn("⚠️ No projects found in Firestore.");
            return res.json([]);
        }

        const projects = snapshot.docs.map(doc => doc.data());
        console.log(`✅ Successfully fetched ${projects.length} projects.`);
        res.json(projects);
    } catch (err) {
        console.error("❌ Firestore Projects Fetch Error:", err);
        res.status(500).json({ 
            error: "Failed to fetch from database.", 
            details: err.message,
            code: err.code 
        });
    }
};
