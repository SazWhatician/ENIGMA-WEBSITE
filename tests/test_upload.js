const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createToken } = require('../api/admin');

// Sample 1x1 transparent PNG in base64
const SAMPLE_PNG_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

async function runTests() {
    console.log("🧪 Starting /api/upload verification tests...");

    const uploadHandler = require('../api/upload');

    // Helper mock res
    function createMockRes() {
        return {
            statusCode: 200,
            headers: {},
            body: null,
            setHeader(k, v) { this.headers[k] = v; },
            status(code) { this.statusCode = code; return this; },
            json(data) { this.body = data; return this; },
            end() { return this; }
        };
    }

    // Test 1: Reject unauthenticated request
    console.log("Test 1: Reject request without admin token...");
    {
        const req = {
            method: 'POST',
            headers: {},
            body: { image: SAMPLE_PNG_BASE64 }
        };
        const res = createMockRes();
        await uploadHandler(req, res);
        assert.strictEqual(res.statusCode, 401, "Expected 401 Unauthorized");
        console.log("  ✅ Successfully rejected unauthenticated request");
    }

    // Test 2: Reject invalid payload with token
    console.log("Test 2: Reject invalid payload with valid token...");
    const adminToken = createToken();
    {
        const req = {
            method: 'POST',
            headers: { authorization: `Bearer ${adminToken}` },
            body: { image: 'invalid-non-data-uri' }
        };
        const res = createMockRes();
        await uploadHandler(req, res);
        assert.strictEqual(res.statusCode, 400, "Expected 400 Bad Request");
        console.log("  ✅ Successfully rejected invalid image data");
    }

    // Test 3: Upload valid image
    console.log("Test 3: Upload valid PNG image...");
    {
        const req = {
            method: 'POST',
            headers: { authorization: `Bearer ${adminToken}` },
            body: {
                image: SAMPLE_PNG_BASE64,
                filename: 'test_avatar.png',
                type: 'team'
            }
        };
        const res = createMockRes();
        await uploadHandler(req, res);
        assert.strictEqual(res.statusCode, 200, "Expected 200 OK");
        assert.ok(res.body && res.body.success, "Expected body.success === true");
        assert.ok(res.body.url, "Expected body.url to exist");
        console.log("  ✅ Successfully processed image upload. Returned URL:", res.body.url);

        // Verify file written to public/uploads
        if (res.body.storage === 'local') {
            const uploadedFilePath = path.join(__dirname, '..', 'public', res.body.url.replace(/^\//, ''));
            assert.ok(fs.existsSync(uploadedFilePath), `Expected uploaded file to exist at ${uploadedFilePath}`);
            console.log("  ✅ Verified file saved to disk at:", uploadedFilePath);

            // Cleanup test file
            fs.unlinkSync(uploadedFilePath);
            console.log("  🧹 Cleaned up test file.");
        }
    }

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
}

runTests().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});
