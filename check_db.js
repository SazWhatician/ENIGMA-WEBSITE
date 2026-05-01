const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkDb() {
    const snapshot = await db.collection('team_members').where('id', '==', 14).get();
    if (snapshot.empty) {
        console.log("No matching documents.");
        return;
    }
    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });
}

checkDb();
