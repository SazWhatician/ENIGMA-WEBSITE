const fs = require('fs');
const path = require('path');
const { getDb } = require('./_firebase');
const { verifyAdminToken } = require('./admin');

const DATA_FILE = path.join(__dirname, '..', 'team_data.json');

function readLocalTeam() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw).team_members || [];
        }
    } catch (e) {
        console.error("Local team read error:", e.message);
    }
    return [];
}

function writeLocalTeam(team_members) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ team_members }, null, 2) + '\n', 'utf8');
    } catch (e) {
        console.error("Local team write error:", e.message);
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

    /* ---------------- GET: RETURN TEAM ---------------- */
    if (req.method === 'GET') {
        try {
            if (db) {
                const snapshot = await db.collection('team_members').orderBy('id', 'asc').get();
                if (!snapshot.empty) {
                    const team = snapshot.docs.map(doc => doc.data());
                    return res.json(team);
                }
            }
            return res.json(readLocalTeam());
        } catch (err) {
            console.error("Firestore Team Fetch Error:", err.message);
            return res.json(readLocalTeam());
        }
    }

    /* ---------------- AUTH CHECK FOR WRITE METHODS ---------------- */
    if (!verifyAdminToken(req)) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED: Security Clearance required."
        });
    }

    /* ---------------- POST: ADD REGULAR MEMBER ---------------- */
    if (req.method === 'POST') {
        try {
            const body = req.body || {};
            if (!body.name) {
                return res.status(400).json({ error: "Name is required." });
            }

            const localTeam = readLocalTeam();
            const nextId = (body.id && typeof body.id === 'number') ? body.id : (localTeam.reduce((max, m) => Math.max(max, m.id || 0), 0) + 1);

            const isAlum = !!body.isAlumni || body.year === 'alumni' || body.tag === 'alumni';
            const rawBatch = (body.batch || (body.year !== 'alumni' ? body.year : 'Batch-2026') || 'Batch-2028').toString().trim();
            const cleanBatch = rawBatch.startsWith('Batch-') ? rawBatch : 'Batch-' + rawBatch;

            const newMember = {
                id: nextId,
                name: body.name.trim(),
                role: (body.role || 'Member').trim(),
                year: (body.year || cleanBatch).toString().trim(),
                batch: cleanBatch,
                isAlumni: isAlum,
                tag: body.tag || (isAlum ? 'alumni' : ''),
                img: body.img || `./team-assets/batch_${cleanBatch.replace('Batch-', '')}/default.jpg`,
                linkedin: body.linkedin || '',
                github: body.github || '',
                instagram: body.instagram || ''
            };

            // Write to Firestore if connected
            if (db) {
                await db.collection('team_members').doc(`member_${newMember.id}`).set(newMember);
            }

            // Write to local JSON
            const updated = [...localTeam.filter(m => m.id !== newMember.id), newMember].sort((a, b) => (a.id || 0) - (b.id || 0));
            writeLocalTeam(updated);

            return res.status(201).json({ success: true, member: newMember });
        } catch (err) {
            console.error("POST /api/team error:", err);
            return res.status(500).json({ error: "Failed to add team member." });
        }
    }

    /* ---------------- PUT: UPDATE MEMBER ---------------- */
    if (req.method === 'PUT') {
        try {
            const body = req.body || {};
            const id = parseInt(body.id, 10);
            if (!id) {
                return res.status(400).json({ error: "Valid member ID is required for update." });
            }

            const localTeam = readLocalTeam();
            const index = localTeam.findIndex(m => m.id === id);

            const updatedMember = {
                ...(index >= 0 ? localTeam[index] : {}),
                ...body,
                id
            };

            if (db) {
                await db.collection('team_members').doc(`member_${id}`).set(updatedMember, { merge: true });
            }

            if (index >= 0) {
                localTeam[index] = updatedMember;
            } else {
                localTeam.push(updatedMember);
            }
            writeLocalTeam(localTeam.sort((a, b) => (a.id || 0) - (b.id || 0)));

            return res.status(200).json({ success: true, member: updatedMember });
        } catch (err) {
            console.error("PUT /api/team error:", err);
            return res.status(500).json({ error: "Failed to update team member." });
        }
    }

    /* ---------------- DELETE: REMOVE MEMBER ---------------- */
    if (req.method === 'DELETE') {
        try {
            const id = parseInt(req.query.id || (req.body && req.body.id), 10);
            if (!id) {
                return res.status(400).json({ error: "Valid member ID required." });
            }

            if (db) {
                await db.collection('team_members').doc(`member_${id}`).delete();
            }

            const localTeam = readLocalTeam();
            const filtered = localTeam.filter(m => m.id !== id);
            writeLocalTeam(filtered);

            return res.status(200).json({ success: true, message: `Member ${id} removed.` });
        } catch (err) {
            console.error("DELETE /api/team error:", err);
            return res.status(500).json({ error: "Failed to delete team member." });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
};
