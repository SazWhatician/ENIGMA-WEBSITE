const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkDb() {
    const snapshot = await db.collection('team_members').where('id', '==', 31).get();
    if (snapshot.empty) {
        console.log("No matching documents.");
        process.exit(0);
    }
    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
    process.exit(0);
}

checkDb();
