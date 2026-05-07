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
        const rawData = fs.readFileSync('./project_data.json', 'utf-8');
        const data = JSON.parse(rawData);

        const projects = data.projects;
        
        console.log(`Starting to upload ${projects.length} projects...`);

        const batch = db.batch();
        const collectionRef = db.collection('projects');

        // Clear existing documents
        const existingDocs = await collectionRef.get();
        existingDocs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Add new documents
        projects.forEach(project => {
            const docRef = collectionRef.doc(`project_${project.id}`);
            batch.set(docRef, project);
        });

        await batch.commit();
        console.log('Successfully uploaded all projects to Firestore!');
    } catch (err) {
        console.error('Error uploading data:', err);
    }
}

uploadData();
