const fs = require('fs');
const path = require('path');
const { getDb } = require('./_firebase');
const { verifyAdminToken } = require('./admin');

const DATA_FILE = path.join(__dirname, '..', 'blog_data.json');

// Read local JSON fallback
function readLocalBlogs() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw).blogs || [];
        }
    } catch (e) {
        console.error("Local blogs read error:", e.message);
    }
    return [];
}

// Write local JSON fallback
function writeLocalBlogs(blogs) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ blogs }, null, 2), 'utf8');
    } catch (e) {
        console.error("Local blogs write error:", e.message);
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const db = getDb();
    const { slug } = req.query || {};

    /* ---------------- GET: FETCH BLOGS ---------------- */
    if (req.method === 'GET') {
        try {
            let blogs = [];
            const local = readLocalBlogs();

            if (db) {
                const snap = await db.collection('blogs').orderBy('id', 'desc').get();
                blogs = snap.empty ? [] : snap.docs.map(doc => doc.data());
            } else {
                blogs = readLocalBlogs();
            }

            // If specific slug requested
            if (slug) {
                const post = blogs.find(b => b.slug === slug.trim());
                if (!post) {
                    return res.status(404).json({ error: "Transmission not found for slug: " + slug });
                }
                return res.status(200).json(post);
            }

            // Return full list (or overview without full sections to keep list light)
            return res.status(200).json(blogs);
        } catch (err) {
            console.error("GET /api/blogs error:", err);
            // Fallback
            const local = readLocalBlogs();
            if (slug) {
                const post = local.find(b => b.slug === slug.trim());
                return post ? res.status(200).json(post) : res.status(404).json({ error: "Post not found" });
            }
            return res.status(200).json(local);
        }
    }

    /* ---------------- AUTH CHECK FOR WRITE METHODS ---------------- */
    if (!verifyAdminToken(req)) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED: Valid Security Clearance Token required."
        });
    }

    /* ---------------- POST: CREATE BLOG ---------------- */
    if (req.method === 'POST') {
        try {
            const body = req.body || {};
            if (!body.title || !body.slug) {
                return res.status(400).json({ error: "Title and slug are required." });
            }

            const cleanSlug = body.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
            const localBlogs = readLocalBlogs();
            
            // Normalize tags & topic
            let tags = [];
            if (Array.isArray(body.tags) && body.tags.length > 0) {
                tags = body.tags.map(t => String(t).trim().toUpperCase()).filter(Boolean);
            } else if (body.topic) {
                tags = String(body.topic).split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
            }
            if (tags.length === 0) tags = ['RESEARCH'];

            const topic = body.topic ? body.topic.trim().toUpperCase() : tags.join(', ');

            const newBlog = {
                id: body.id || Date.now(),
                slug: cleanSlug,
                title: body.title.trim(),
                topic: topic,
                tags: tags,
                author: body.author ? body.author.trim() : 'ENIGMA Admin',
                authorRole: body.authorRole ? body.authorRole.trim() : 'Core Member',
                date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
                readTime: body.readTime || '5 min',
                cover: body.cover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                summary: body.summary || '',
                sections: Array.isArray(body.sections) && body.sections.length > 0 ? body.sections : [
                    { id: 'sec-1', title: 'Blog Overview', content: body.content || 'Blog content...' }
                ]
            };

            // Write to Firestore if connected
            if (db) {
                await db.collection('blogs').doc(`blog_${newBlog.slug}`).set(newBlog);
            }

            // Sync to local JSON
            const updated = [newBlog, ...localBlogs.filter(b => b.slug !== cleanSlug)];
            writeLocalBlogs(updated);

            return res.status(201).json({ success: true, blog: newBlog });
        } catch (err) {
            console.error("POST /api/blogs error:", err);
            return res.status(500).json({ error: "Failed to create blog post.", details: err.message });
        }
    }

    /* ---------------- PUT: UPDATE BLOG ---------------- */
    if (req.method === 'PUT') {
        try {
            const body = req.body || {};
            const targetSlug = slug || body.slug;
            if (!targetSlug) {
                return res.status(400).json({ error: "Target slug is required for update." });
            }

            const localBlogs = readLocalBlogs();
            const existingIndex = localBlogs.findIndex(b => b.slug === targetSlug);

            let updatedTags = undefined;
            if (Array.isArray(body.tags)) {
                updatedTags = body.tags.map(t => String(t).trim().toUpperCase()).filter(Boolean);
            } else if (body.topic && !body.tags) {
                updatedTags = String(body.topic).split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
            }

            const updatedBlog = {
                ...(existingIndex >= 0 ? localBlogs[existingIndex] : {}),
                ...body,
                ...(updatedTags ? { tags: updatedTags } : {}),
                slug: targetSlug
            };

            if (db) {
                await db.collection('blogs').doc(`blog_${targetSlug}`).set(updatedBlog, { merge: true });
            }

            if (existingIndex >= 0) {
                localBlogs[existingIndex] = updatedBlog;
            } else {
                localBlogs.unshift(updatedBlog);
            }
            writeLocalBlogs(localBlogs);

            return res.status(200).json({ success: true, blog: updatedBlog });
        } catch (err) {
            console.error("PUT /api/blogs error:", err);
            return res.status(500).json({ error: "Failed to update blog post." });
        }
    }

    /* ---------------- DELETE: REMOVE BLOG ---------------- */
    if (req.method === 'DELETE') {
        try {
            const targetSlug = slug || (req.body && req.body.slug);
            if (!targetSlug) {
                return res.status(400).json({ error: "Slug is required for deletion." });
            }

            if (db) {
                await db.collection('blogs').doc(`blog_${targetSlug}`).delete();
            }

            const localBlogs = readLocalBlogs();
            const filtered = localBlogs.filter(b => b.slug !== targetSlug);
            writeLocalBlogs(filtered);

            return res.status(200).json({ success: true, message: `Blog '${targetSlug}' purged successfully.` });
        } catch (err) {
            console.error("DELETE /api/blogs error:", err);
            return res.status(500).json({ error: "Failed to delete blog post." });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
};
