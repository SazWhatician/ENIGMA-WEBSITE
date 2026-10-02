const assert = require('assert');
const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');

async function runE2E() {
    console.log("==================================================");
    console.log("🛰️ STARTING ENIGMA END-TO-END VERIFICATION SUITE");
    console.log("==================================================");

    // 1. Verify all new public files exist
    const requiredFiles = [
        'blog_data.json',
        'api/admin.js',
        'api/blogs.js',
        'api/team.js',
        'api/projects.js',
        'public/blog.html',
        'public/blog-post.html',
        'public/enigma-admin.html',
        'server.js',
        'vercel.json'
    ];

    for (const f of requiredFiles) {
        const full = path.join(__dirname, '..', f);
        assert.ok(fs.existsSync(full), `Missing expected file: ${f}`);
        console.log(`✅ File Verified: ${f}`);
    }

    // Snapshot JSON data for clean restoration
    const teamFile = path.join(__dirname, '..', 'team_data.json');
    const projFile = path.join(__dirname, '..', 'project_data.json');
    const blogFile = path.join(__dirname, '..', 'blog_data.json');
    const origTeam = fs.existsSync(teamFile) ? fs.readFileSync(teamFile, 'utf8') : null;
    const origProjects = fs.existsSync(projFile) ? fs.readFileSync(projFile, 'utf8') : null;
    const origBlogs = fs.existsSync(blogFile) ? fs.readFileSync(blogFile, 'utf8') : null;

    // 2. Start temporary Express test instance on free port
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.all('/api/admin', require('../api/admin'));
    app.all('/api/blogs', require('../api/blogs'));
    app.all('/api/team', require('../api/team'));
    app.all('/api/projects', require('../api/projects'));

    app.get('/enigma-admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'enigma-admin.html')));
    app.get('/blog', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'blog.html')));
    app.get('/blog/:slug', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'blog-post.html')));

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    console.log(`\n🚀 Local Verification Server listening on ${baseUrl}\n`);

    async function req(url, options = {}) {
        return new Promise((resolve, reject) => {
            const u = new URL(url, baseUrl);
            const opt = {
                hostname: u.hostname,
                port: u.port,
                path: u.pathname + u.search,
                method: options.method || 'GET',
                headers: options.headers || {}
            };
            const request = http.request(opt, (response) => {
                let body = '';
                response.on('data', chunk => body += chunk);
                response.on('end', () => {
                    resolve({
                        status: response.statusCode,
                        headers: response.headers,
                        text: body,
                        json: () => JSON.parse(body)
                    });
                });
            });
            request.on('error', reject);
            if (options.body) {
                request.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
            }
            request.end();
        });
    }

    try {
        // --- TEST 1: Public Blog Route ---
        {
            const res = await req('/blog');
            assert.strictEqual(res.status, 200);
            assert.ok(res.text.includes('blueprint-bg') || res.text.includes('blog-flow-canvas'), "Expected blueprint-bg or blog-flow-canvas in /blog");
            assert.ok(res.text.includes('data-barba-namespace="blog"'), "Expected Barba namespace blog");
            assert.ok(res.text.includes('id="topic-filters"'), "Expected topic-filters in /blog");
            console.log("✅ Passed: /blog serves valid HTML with blueprint background and topic filters");
        }

        // --- TEST 2: Public Blog Post Route ---
        {
            const res = await req('/blog/neural-lattice-architectures');
            assert.strictEqual(res.status, 200);
            assert.ok(res.text.includes('id="reading-progress-bar"'), "Expected reading-progress-bar");
            assert.ok(res.text.includes('id="bullet-nav"'), "Expected bullet-nav HUD");
            assert.ok(res.text.includes('TRANSMISSION INDEX'), "Expected TRANSMISSION INDEX title");
            console.log("✅ Passed: /blog/:slug serves article reader with floating bullet HUD");
        }

        // --- TEST 3: Secret Admin Route ---
        {
            const res = await req('/enigma-admin');
            assert.strictEqual(res.status, 200);
            assert.ok(res.text.includes('id="passcode-input"'), "Expected passcode-input in admin terminal");
            assert.ok(res.text.includes('id="admin-workspace"'), "Expected admin-workspace container");
            assert.ok(res.text.includes('tab-blogs'), "Expected Dispatches tab");
            assert.ok(res.text.includes('tab-team'), "Expected Operatives tab");
            assert.ok(res.text.includes('tab-projects'), "Expected Initiatives tab");
            console.log("✅ Passed: /enigma-admin serves classified terminal gatekeeper and CMS");
        }

        // --- TEST 4: Admin Authentication ---
        let adminToken;
        {
            // Wrong passcode
            const badRes = await req('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: { passcode: 'wrong_secret' }
            });
            assert.strictEqual(badRes.status, 401);

            // Correct passcode
            const goodRes = await req('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: { passcode: 'enigma2026' }
            });
            assert.strictEqual(goodRes.status, 200);
            const data = goodRes.json();
            assert.strictEqual(data.success, true);
            assert.ok(data.token, "Expected session token");
            adminToken = data.token;
            console.log("✅ Passed: /api/admin validates passcode and issues signed session token");
        }

        // --- TEST 5: Blogs API CRUD ---
        {
            const listRes = await req('/api/blogs');
            assert.strictEqual(listRes.status, 200);
            const blogs = listRes.json();
            assert.ok(blogs.length >= 3, "Expected at least 3 seed blogs");

            // Specific post
            const postRes = await req('/api/blogs?slug=neural-lattice-architectures');
            assert.strictEqual(postRes.status, 200);
            const post = postRes.json();
            assert.strictEqual(post.slug, 'neural-lattice-architectures');
            assert.strictEqual(post.topic, 'AI/ML');
            assert.ok(post.sections.length >= 5, "Expected sections in post");

            // Admin Create Post
            const newSlug = 'e2e-test-cyber-post';
            const createRes = await req('/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: {
                    title: "E2E Automated Cyber Post",
                    slug: newSlug,
                    topic: "CYBERSECURITY",
                    author: "E2E Bot",
                    readTime: "4 min",
                    sections: [
                        { id: 'sec-1', title: 'Initialization Step', content: 'Testing automated section generation.' },
                        { id: 'sec-2', title: 'Verification Step', content: 'Testing bullet point indexing.' }
                    ]
                }
            });
            assert.strictEqual(createRes.status, 201);
            console.log("✅ Passed: Created new blog dispatch with custom bullet sections");

            // Verify Created Post
            const verifyRes = await req(`/api/blogs?slug=${newSlug}`);
            assert.strictEqual(verifyRes.status, 200);
            const created = verifyRes.json();
            assert.strictEqual(created.title, "E2E Automated Cyber Post");
            assert.strictEqual(created.sections.length, 2);

            // Clean up / Delete Post
            const delRes = await req(`/api/blogs?slug=${newSlug}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            assert.strictEqual(delRes.status, 200);
            console.log("✅ Passed: Successfully purged temporary test dispatch");
        }

        // --- TEST 6: Team API CRUD with Batch Year ---
        {
            const testId = 777777;
            const addRes = await req('/api/team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: {
                    id: testId,
                    name: "E2E Operative",
                    role: "Quantum Security Lead",
                    year: "2028",
                    img: "./team-assets/batch_2028/default.jpg"
                }
            });
            assert.strictEqual(addRes.status, 201);
            const added = addRes.json();
            assert.strictEqual(added.member.year, "2028");

            // Delete test member
            const delRes = await req(`/api/team?id=${testId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            assert.strictEqual(delRes.status, 200);
            console.log("✅ Passed: Team Operative CRUD validated with batch assignment");
        }

        // --- TEST 7: Projects API CRUD ---
        {
            const testId = 666666;
            const addRes = await req('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: {
                    id: testId,
                    title: "E2E Project Alpha",
                    desc: "Autonomous infrastructure pipeline.",
                    link: "https://enigmavssut.in"
                }
            });
            assert.strictEqual(addRes.status, 201);

            // Delete test project
            const delRes = await req(`/api/projects?id=${testId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            assert.strictEqual(delRes.status, 200);
            console.log("✅ Passed: Projects Initiative CRUD validated");
        }

        console.log("\n==================================================");
        console.log("🎉 ALL E2E VERIFICATION CHECKS PASSED PERFECTLY!");
        console.log("==================================================\n");

    } finally {
        server.close();
        // Restore local JSON data to pristine original state
        if (origTeam) fs.writeFileSync(teamFile, origTeam, 'utf8');
        if (origProjects) fs.writeFileSync(projFile, origProjects, 'utf8');
        if (origBlogs) fs.writeFileSync(blogFile, origBlogs, 'utf8');
    }
}

runE2E().catch(err => {
    console.error("\n❌ E2E VERIFICATION FAILED:", err);
    process.exit(1);
});
