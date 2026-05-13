const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// --- FIREBASE INITIALIZATION ---
let initialized = false;

function initFirebase() {
    if (admin.apps.length > 0) {
        initialized = true;
        return;
    }

    let serviceAccount;

    try {
        const keyPath = path.resolve(process.cwd(), 'firebase-key.json');
        if (fs.existsSync(keyPath)) {
            serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            console.log("🔐 Using local firebase-key.json for authentication.");
        } else {
            console.log("ℹ️ Local firebase-key.json not found, checking environment variables.");
        }
    } catch (err) {
        console.warn("⚠️ Error checking for local key file:", err.message);
    }

    if (!serviceAccount) {
        // Production (Vercel): Handle both plain text JSON and Base64 format
        let envVal = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT;
        
        if (envVal) {
            try {
                envVal = envVal.trim();
                // Check if it's double-quoted (sometimes happens with Vercel env vars)
                if (envVal.startsWith('"') && envVal.endsWith('"')) {
                    envVal = envVal.substring(1, envVal.length - 1);
                }

                if (envVal.startsWith('{')) {
                    serviceAccount = JSON.parse(envVal);
                } else {
                    // Try Base64
                    const decoded = Buffer.from(envVal, 'base64').toString('utf8');
                    if (decoded.startsWith('{')) {
                        serviceAccount = JSON.parse(decoded);
                    } else {
                        throw new Error("Decoded string is not a valid JSON object.");
                    }
                }

                // Fix private key: replace literal "\n" strings with real newlines
                if (serviceAccount && serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key
                        .replace(/\\n/g, '\n')
                        .replace(/\\r/g, '');
                }
                console.log("☁️ Successfully initialized Firebase using environment variables.");
            } catch (parseError) {
                console.error("❌ CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT variable:", parseError.message);
            }
        } else {
            console.error("❌ CRITICAL: No FIREBASE_SERVICE_ACCOUNT found in environment variables!");
        }
    }

    if (serviceAccount) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            initialized = true;
        } catch (initErr) {
            console.error("❌ CRITICAL: firebase-admin initializeApp failed:", initErr.message);
        }
    } else {
        console.error("❌ CRITICAL: Service account object is missing, cannot initialize Firebase.");
    }
}

function getDb() {
    initFirebase();
    return admin.apps.length ? admin.firestore() : null;
}

module.exports = { getDb };
