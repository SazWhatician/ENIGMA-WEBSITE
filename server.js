require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- API ENDPOINTS ---
app.post('/api/contact', require('./api/contact'));
app.all('/api/admin', require('./api/admin'));
app.all('/api/blogs', require('./api/blogs'));
app.all('/api/projects', require('./api/projects'));
app.all('/api/team', require('./api/team'));

// --- CLEAN FRONTEND ROUTES ---
app.get('/enigma-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'enigma-admin.html'));
});
app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});
app.get('/blog/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog-post.html'));
});
app.get('/team', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'team.html'));
});
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'events.html'));
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});
app.get('/project', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'project.html'));
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔌 ENIGMA Server running on http://0.0.0.0:${PORT}`);
});