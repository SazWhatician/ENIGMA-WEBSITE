const path = require('path');
const express = require('express');

// IMPORT THE NEW VERCEL-READY EXPRESS APP
// This pulls in all your Firebase and routing logic from the serverless function target!
const app = require('./api/index.js');
const PORT = process.env.PORT || 3000;

// ADD LOCAL STATIC FILE SERVING FOR DEVELOPMENT
// In production, Vercel native platform automatically serves your static pages.
app.use(express.static(__dirname));

// START LOCAL SERVER (Ignored by Vercel)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔌 ENIGMA Server running locally on http://0.0.0.0:${PORT}`);
    console.log(`🌐 Local Vercel-like dev mode enabled.`);
});