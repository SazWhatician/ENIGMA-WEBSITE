const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./firebase-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function uploadData() {
    try {
        const rawData = fs.readFileSync('./team_data.json', 'utf-8');
        const data = JSON.parse(rawData);

        const teamMembers = data.team_members;
        
        console.log(`Starting to upload ${teamMembers.length} team members...`);

        const batch = db.batch();
        const collectionRef = db.collection('team_members');

        // First, get all existing documents to delete them or we can just overwrite based on a document ID like "member_${id}"
        // But since you might want clean insert, let's just clear the collection first.
        const existingDocs = await collectionRef.get();
        existingDocs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Add new documents
        teamMembers.forEach(member => {
            // we will use member_${id} as document ID
            const docRef = collectionRef.doc(`member_${member.id}`);
            batch.set(docRef, member);
        });

        await batch.commit();
        console.log('Successfully uploaded all team members to Firestore!');
    } catch (err) {
        console.error('Error uploading data:', err);
    }
}

uploadData();
