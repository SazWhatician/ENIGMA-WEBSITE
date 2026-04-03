const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// --- FIREBASE INITIALIZATION ---
let initialized = false;

function initFirebase() {
    if (initialized || admin.apps.length) {
        initialized = true;
        return;
    }

    let serviceAccount;

    try {
        const keyPath = path.resolve(__dirname, '..', 'firebase-key.json');
        if (fs.existsSync(keyPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            console.log("🔐 Using local firebase-key.json for authentication.");
        } else {
            throw new Error("Local file not found, checking environment...");
        }
    } catch (err) {
        // Production (Vercel): Handle both plain text JSON and Base64 format
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
                    serviceAccount.private_key = serviceAccount.private_key
                        .replace(/\\r\\n/g, '\n')
                        .replace(/\\r/g, '')
                        .replace(/\\n/g, '\n');
                }
                console.log("☁️ Using environment variables for authentication.");
            } catch (parseError) {
                console.error("❌ CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT variable.");
            }
        } else {
            console.error("❌ CRITICAL: No FIREBASE_SERVICE_ACCOUNT found in ENV!");
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        initialized = true;
    }
}

function getDb() {
    initFirebase();
    return admin.apps.length ? admin.firestore() : null;
}

module.exports = { getDb };
