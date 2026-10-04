const assert = require('assert');
const path = require('path');

function createMockReqRes({ method = 'GET', query = {}, body = {}, headers = {}, url = '/' } = {}) {
    const req = { method, query, body, headers, url };
    let statusCode = 200;
    let responseData = null;
    let responseHeaders = {};

    const res = {
        status(code) {
            statusCode = code;
            return res;
        },
        setHeader(key, val) {
            responseHeaders[key] = val;
            return res;
        },
        json(data) {
            responseData = data;
            return res;
        },
        end(data) {
            if (data) responseData = data;
            return res;
        },
        getStatusCode: () => statusCode,
        getData: () => responseData,
        getHeaders: () => responseHeaders
    };
    return { req, res };
}

async function runTests() {
    console.log("Running TDD Test Suite for Backend Endpoints...");

    // Test 1: Admin Auth Handler
    const adminHandler = require('../api/admin');

    // Invalid passcode test
    {
        const { req, res } = createMockReqRes({
            method: 'POST',
            body: { passcode: 'wrong-passcode' }
        });
        await adminHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 401, "Expected 401 for wrong passcode");
        assert.strictEqual(res.getData().success, false);
        console.log("✅ Passed: Admin rejects invalid passcode with 401");
    }

    // Valid passcode test
    let validToken;
    {
        const validPass = process.env.ADMIN_PASSCODE || 'enigma2026';
        const { req, res } = createMockReqRes({
            method: 'POST',
            body: { passcode: validPass }
        });
        await adminHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 200, "Expected 200 for valid passcode");
        assert.strictEqual(res.getData().success, true);
        assert.ok(res.getData().token, "Expected session token in response");
        validToken = res.getData().token;
        console.log("✅ Passed: Admin accepts valid passcode and returns token");
    }

    // Test 2: Blogs Handler
    const blogsHandler = require('../api/blogs');

    // GET all blogs initially
    {
        const { req, res } = createMockReqRes({ method: 'GET' });
        await blogsHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 200);
        const list = res.getData();
        assert.ok(Array.isArray(list), "Expected array of blogs");
        console.log(`✅ Passed: GET /api/blogs returned ${list.length} posts (Array verified)`);
    }

    // POST blog without auth (must fail)
    {
        const { req, res } = createMockReqRes({
            method: 'POST',
            body: { title: "Unauthenticated Test" }
        });
        await blogsHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 401, "Expected 401 for unauthorized post creation");
        console.log("✅ Passed: POST /api/blogs requires auth");
    }

    // POST blog with auth
    const testSlug = 'tdd-test-transmission-' + Date.now();
    {
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: `Bearer ${validToken}` },
            body: {
                title: "TDD Test Transmission",
                slug: testSlug,
                topic: "AI/ML",
                tags: ["AI", "RESEARCH"],
                author: "TDD Agent",
                readTime: "3 min",
                cover: "https://example.com/cover.jpg",
                summary: "Summary of test post",
                sections: [
                    { id: "sec-1", title: "Test Section Alpha", content: "Body alpha" }
                ]
            }
        });
        await blogsHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 201, "Expected 201 for post creation");
        console.log("✅ Passed: POST /api/blogs created test post with auth");
    }

    // GET single blog by slug
    {
        const { req, res } = createMockReqRes({
            method: 'GET',
            query: { slug: testSlug }
        });
        await blogsHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 200);
        const post = res.getData();
        assert.strictEqual(post.slug, testSlug);
        assert.ok(Array.isArray(post.sections) && post.sections.length >= 1, "Expected sections in post");
        console.log("✅ Passed: GET /api/blogs?slug=... returned post with sections");
    }

    // GET non-existent slug
    {
        const { req, res } = createMockReqRes({
            method: 'GET',
            query: { slug: 'unknown-mystery-slug-404' }
        });
        await blogsHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 404, "Expected 404 for unknown slug");
        console.log("✅ Passed: GET /api/blogs?slug=404 returned 404");
    }

    // DELETE blog with auth
    {
        const { req, res } = createMockReqRes({
            method: 'DELETE',
            headers: { authorization: `Bearer ${validToken}` },
            query: { slug: testSlug }
        });
        await blogsHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 200, "Expected 200 for post deletion");
        console.log("✅ Passed: DELETE /api/blogs deleted test post with auth");
    }

    // Test 3: Team API with Admin
    const teamHandler = require('../api/team');
    const testMemberId = 999999;
    {
        // Add member with auth
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: `Bearer ${validToken}` },
            body: {
                id: testMemberId,
                name: "Test Operative Alpha",
                role: "Cyber Operator",
                year: "2028"
            }
        });
        await teamHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 201);
        console.log("✅ Passed: POST /api/team created member with auth");

        // Delete test member
        const { req: delReq, res: delRes } = createMockReqRes({
            method: 'DELETE',
            headers: { authorization: `Bearer ${validToken}` },
            query: { id: testMemberId }
        });
        await teamHandler(delReq, delRes);
        assert.strictEqual(delRes.getStatusCode(), 200);
        console.log("✅ Passed: DELETE /api/team removed member with auth");
    }

    // Test 4: Projects API with Admin
    const projectsHandler = require('../api/projects');
    const testProjId = 888888;
    {
        // Add project with auth
        const { req, res } = createMockReqRes({
            method: 'POST',
            headers: { authorization: `Bearer ${validToken}` },
            body: {
                id: testProjId,
                title: "Test Cyber Initiative",
                desc: "Autonomous verification kernel."
            }
        });
        await projectsHandler(req, res);
        assert.strictEqual(res.getStatusCode(), 201);
        console.log("✅ Passed: POST /api/projects created project with auth");

        // Delete test project
        const { req: delReq, res: delRes } = createMockReqRes({
            method: 'DELETE',
            headers: { authorization: `Bearer ${validToken}` },
            query: { id: testProjId }
        });
        await projectsHandler(delReq, delRes);
        assert.strictEqual(delRes.getStatusCode(), 200);
        console.log("✅ Passed: DELETE /api/projects removed project with auth");
    }

    console.log("\n🚀 ALL 11 ENDPOINT TESTS PASSED WITH PRISTINE OUTPUT! 🚀\n");
}

runTests().catch(err => {
    console.error("TEST FAILED:", err);
    process.exit(1);
});
