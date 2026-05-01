const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkDb() {
    const snapshot = await db.collection('team_members').orderBy('id', 'asc').get();
    const ids = [];
    snapshot.forEach(doc => {
        ids.push(doc.data().id);
    });
    console.log("IDs in Firebase:", ids.join(', '));
    process.exit(0);
}

checkDb();
