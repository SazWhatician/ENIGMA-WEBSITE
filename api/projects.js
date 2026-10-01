const fs = require('fs');
const path = require('path');
const { getDb } = require('./_firebase');
const { verifyAdminToken } = require('./admin');

const DATA_FILE = path.join(__dirname, '..', 'project_data.json');

function readLocalProjects() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw).projects || [];
        }
    } catch (e) {
        console.error("Local projects read error:", e.message);
    }
    return [];
}

function writeLocalProjects(projects) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ projects }, null, 2) + '\n', 'utf8');
    } catch (e) {
        console.error("Local projects write error:", e.message);
    }
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const db = getDb();

    /* ---------------- GET: RETURN PROJECTS ---------------- */
    if (req.method === 'GET') {
        try {
            if (db) {
                const snapshot = await db.collection('projects').orderBy('id', 'asc').get();
                if (!snapshot.empty) {
                    const projects = snapshot.docs.map(doc => doc.data());
                    return res.json(projects);
                }
            }
            return res.json(readLocalProjects());
        } catch (err) {
            console.error("Firestore Projects Fetch Error:", err.message);
            return res.json(readLocalProjects());
        }
    }

    /* ---------------- AUTH CHECK FOR WRITE METHODS ---------------- */
    if (!verifyAdminToken(req)) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED: Security Clearance required."
        });
    }

    /* ---------------- POST: ADD PROJECT ---------------- */
    if (req.method === 'POST') {
        try {
            const body = req.body || {};
            if (!body.title) {
                return res.status(400).json({ error: "Project title is required." });
            }

            const localProjects = readLocalProjects();
            const nextId = (body.id && typeof body.id === 'number') ? body.id : (localProjects.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1);

            const newProject = {
                id: nextId,
                title: body.title.trim(),
                desc: (body.desc || '').trim(),
                img: body.img || './project-assets/default.png',
                link: body.link || 'https://enigmavssut.in'
            };

            if (db) {
                await db.collection('projects').doc(`project_${newProject.id}`).set(newProject);
            }

            const updated = [...localProjects.filter(p => p.id !== newProject.id), newProject].sort((a, b) => (a.id || 0) - (b.id || 0));
            writeLocalProjects(updated);

            return res.status(201).json({ success: true, project: newProject });
        } catch (err) {
            console.error("POST /api/projects error:", err);
            return res.status(500).json({ error: "Failed to create project." });
        }
    }

    /* ---------------- PUT: UPDATE PROJECT ---------------- */
    if (req.method === 'PUT') {
        try {
            const body = req.body || {};
            const id = parseInt(body.id, 10);
            if (!id) {
                return res.status(400).json({ error: "Valid project ID required." });
            }

            const localProjects = readLocalProjects();
            const index = localProjects.findIndex(p => p.id === id);

            const updatedProject = {
                ...(index >= 0 ? localProjects[index] : {}),
                ...body,
                id
            };

            if (db) {
                await db.collection('projects').doc(`project_${id}`).set(updatedProject, { merge: true });
            }

            if (index >= 0) {
                localProjects[index] = updatedProject;
            } else {
                localProjects.push(updatedProject);
            }
            writeLocalProjects(localProjects.sort((a, b) => (a.id || 0) - (b.id || 0)));

            return res.status(200).json({ success: true, project: updatedProject });
        } catch (err) {
            console.error("PUT /api/projects error:", err);
            return res.status(500).json({ error: "Failed to update project." });
        }
    }

    /* ---------------- DELETE: REMOVE PROJECT ---------------- */
    if (req.method === 'DELETE') {
        try {
            const id = parseInt(req.query.id || (req.body && req.body.id), 10);
            if (!id) {
                return res.status(400).json({ error: "Valid project ID required." });
            }

            if (db) {
                await db.collection('projects').doc(`project_${id}`).delete();
            }

            const localProjects = readLocalProjects();
            const filtered = localProjects.filter(p => p.id !== id);
            writeLocalProjects(filtered);

            return res.status(200).json({ success: true, message: `Project ${id} removed.` });
        } catch (err) {
            console.error("DELETE /api/projects error:", err);
            return res.status(500).json({ error: "Failed to delete project." });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
};
