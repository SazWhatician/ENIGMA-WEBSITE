const { getDb } = require('./_firebase');
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    try {
        const { user_name, user_email, message } = req.body;

        if (!user_name || !user_email || !message) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const db = getDb();
        if (db) {
            // 1. Save to Firebase Firestore (Bulletproof storage)
            await db.collection('contacts').add({
                name: user_name,
                email: user_email,
                message: message,
                timestamp: new Date().toISOString(),
                status: 'unread'
            });
            console.log(`✅ Contact from ${user_email} saved to Firebase.`);
        }

        // 2. Try sending Email if Nodemailer is configured
        const emailPass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS;
        if (emailPass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'enigma.vssut@gmail.com',
                    pass: emailPass
                }
            });

            const mailOptions = {
                from: 'enigma.vssut@gmail.com',
                to: 'enigma.vssut@gmail.com',
                subject: `New Contact from ${user_name}`,
                text: `Name: ${user_name}\nEmail: ${user_email}\n\nMessage:\n${message}`,
                replyTo: user_email
            };

            await transporter.sendMail(mailOptions);
            console.log(`✉️ Email successfully sent to enigma.vssut@gmail.com`);
        } else {
            console.log(`⚠️ Email sending skipped (No GMAIL_APP_PASSWORD found in .env)`);
        }

        return res.status(200).json({ success: true, message: "Transmission received." });

    } catch (err) {
        console.error("❌ Contact API Error:", err);
        return res.status(500).json({ error: "Failed to process transmission." });
    }
};
