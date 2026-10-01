const crypto = require('crypto');

const SECRET_KEY = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_PASSCODE || 'enigma_classified_kernel_2026';
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'enigma2026';

// Helper to sign token
function createToken() {
    const payload = JSON.stringify({
        role: 'enigma_admin',
        ts: Date.now()
    });
    const hmac = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    return Buffer.from(payload).toString('base64') + '.' + hmac;
}

// Helper to verify token
function verifyAdminToken(req) {
    const authHeader = req.headers ? (req.headers.authorization || req.headers.Authorization) : null;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
    } else if (req.body && req.body.token) {
        token = req.body.token;
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token || !token.includes('.')) return false;

    try {
        const [b64, hmac] = token.split('.');
        const payloadStr = Buffer.from(b64, 'base64').toString('utf8');
        const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(payloadStr).digest('hex');
        
        if (hmac !== expectedHmac) return false;

        const payload = JSON.parse(payloadStr);
        // Valid for 7 days
        if (Date.now() - payload.ts > 7 * 24 * 60 * 60 * 1000) return false;

        return true;
    } catch (e) {
        return false;
    }
}

async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { passcode, token } = req.body || {};

        // Token verify check
        if (token && !passcode) {
            const isValid = verifyAdminToken({ headers: { authorization: `Bearer ${token}` } });
            return res.json({ success: isValid });
        }

        // Passcode login
        if (passcode && passcode.trim() === ADMIN_PASSCODE.trim()) {
            const newToken = createToken();
            return res.status(200).json({
                success: true,
                message: "SECURITY CLEARANCE VERIFIED.",
                token: newToken
            });
        }

        return res.status(401).json({
            success: false,
            error: "ACCESS DENIED: Invalid Security Passcode."
        });
    }

    // Default GET status check
    const isAuthed = verifyAdminToken(req);
    res.json({ authenticated: isAuthed });
}

handler.verifyAdminToken = verifyAdminToken;
handler.createToken = createToken;

module.exports = handler;
