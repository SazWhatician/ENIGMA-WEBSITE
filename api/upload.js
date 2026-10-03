const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getStorage } = require('./_firebase');
const { verifyAdminToken } = require('./admin');

// Upload directory for local server environment
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Require admin clearance
    if (!verifyAdminToken(req)) {
        return res.status(401).json({
            success: false,
            error: 'UNAUTHORIZED: Valid Security Clearance Token required to upload assets.'
        });
    }

    try {
        const { image, filename = 'image', type = 'asset' } = req.body || {};

        if (!image || typeof image !== 'string') {
            return res.status(400).json({ error: 'Missing image data (Base64 data URL required).' });
        }

        // Parse Data URL: data:image/png;base64,....
        const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ error: 'Invalid image format. Expected Base64 Data URL (image/png, image/jpeg, image/webp).' });
        }

        let ext = matches[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        // Normalize any svg+xml or other variants
        if (ext.includes('svg')) ext = 'svg';

        const buffer = Buffer.from(matches[2], 'base64');

        // Size check (max 10MB)
        if (buffer.length > 10 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image exceeds maximum allowable size (10MB).' });
        }

        const safePrefix = type.replace(/[^a-z0-9_-]/gi, '') || 'asset';
        const uniqueId = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const outputFilename = `${safePrefix}_${uniqueId}.${ext}`;

        // 1. Try Firebase Storage if bucket is configured
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
        if (bucketName) {
            try {
                const storage = getStorage();
                if (storage) {
                    const bucket = storage.bucket(bucketName);
                    const file = bucket.file(`uploads/${outputFilename}`);
                    const downloadToken = crypto.randomUUID ? crypto.randomUUID() : uniqueId;

                    await file.save(buffer, {
                        metadata: {
                            contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
                            metadata: {
                                firebaseStorageDownloadTokens: downloadToken
                            }
                        },
                        public: true
                    });

                    // Direct public URL or Firebase Storage URL with token
                    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/uploads%2F${outputFilename}?alt=media&token=${downloadToken}`;
                    return res.status(200).json({
                        success: true,
                        url: publicUrl,
                        storage: 'firebase',
                        filename: outputFilename
                    });
                }
            } catch (storageErr) {
                console.warn('⚠️ Firebase Storage upload failed, attempting local fallback:', storageErr.message);
            }
        }

        // 2. Try writing to public/uploads directory (Works for Node/Express server)
        try {
            if (!fs.existsSync(UPLOADS_DIR)) {
                fs.mkdirSync(UPLOADS_DIR, { recursive: true });
            }
            const filePath = path.join(UPLOADS_DIR, outputFilename);
            fs.writeFileSync(filePath, buffer);

            const publicUrl = `/uploads/${outputFilename}`;
            return res.status(200).json({
                success: true,
                url: publicUrl,
                storage: 'local',
                filename: outputFilename
            });
        } catch (fsErr) {
            console.warn('⚠️ Local filesystem write failed (serverless read-only environment):', fsErr.message);
            
            // 3. Fallback: Return optimized self-contained Data URL
            return res.status(200).json({
                success: true,
                url: image,
                storage: 'embedded',
                filename: outputFilename
            });
        }
    } catch (err) {
        console.error('❌ Upload Error:', err);
        return res.status(500).json({ error: 'Asset transmission failed: ' + err.message });
    }
};
