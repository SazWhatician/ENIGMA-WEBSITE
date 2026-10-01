# ENIGMA Blog Subsystem & Secret Cyber-Admin Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Awwwards-grade Blog platform with Three.js 3D backdrop, kinetic typography, GSAP FLIP topic shuffle, dedicated article reader with an interactive floating bullet HUD, and a secret cyber-admin CMS (`/enigma-admin`) to manage blogs, regular team members, and projects.

**Architecture:** A lightweight dynamic architecture where public static templates (`blog.html`, `blog-post.html`, `enigma-admin.html`) run with Three.js, GSAP FLIP, and Barba.js, communicating via REST serverless endpoints (`api/blogs.js`, `api/admin.js`, `api/team.js`, `api/projects.js`) backed by Firestore with local JSON fallbacks.

**Tech Stack:** Vanilla JS, Three.js, GSAP 3 (Flip, ScrollTrigger, ScrollToPlugin), Barba.js, Tailwind CSS CDN, Node.js Express, Vercel Serverless Functions, Firebase Firestore Admin SDK.

**Spec:** [`docs/superpowers/specs/2026-10-02-enigma-blog-and-admin-design.md`](file:///c:/Users/saswa/Desktop/ENIGMA/docs/superpowers/specs/2026-10-02-enigma-blog-and-admin-design.md)

## Global Constraints
- Neon green `#2BA648`, obsidian `#000000`, and typography (`Syncopate`, `Host Grotesk`, `Cinzel`) must follow established theme.
- All dynamic routes (`/blog`, `/blog/:slug`, `/enigma-admin`) must resolve on both local Express server and Vercel.
- Special card types (Apex, Devcard) remain code-driven; regular cards can be edited in Admin.
- All admin mutations require valid session token verification.

## Review Focus
1. **Empty / Missing Slug**: Requesting `/blog/non-existent-slug` must show a stylish "Transmission Not Found" screen with a back button, not crash.
2. **Offline / Missing Firebase Key**: If Firestore is unreachable locally, APIs must fall back gracefully to local JSON files (`blog_data.json`, `team_data.json`, `project_data.json`).
3. **Card Shuffle Layout Reflow**: Rapid filter switching must not cause card overlapping or layout jumping.
4. **ScrollSpy Drift**: Fast scrolling through long articles must reliably activate the correct bullet point without lagging.
5. **Unauthorized Admin Requests**: Direct POST/PUT/DELETE to API endpoints without valid bearer token must return HTTP 401.

---

### Task 1: Backend Foundation & Data Schemas

**Files:**
- Create: `blog_data.json`
- Create: `api/admin.js`
- Create: `api/blogs.js`
- Modify: `api/team.js`
- Modify: `api/projects.js`
- Test: `tests/api_blogs.test.js`

**Interfaces:**
- `POST /api/admin/login`: `{ passcode: string }` ➔ `{ success: boolean, token: string }`
- `GET /api/blogs`: `?slug=...` ➔ `{ blog: object }` or `[ blogs ]`
- `POST /api/blogs`: Headers `{ Authorization: "Bearer <token>" }`, Body `{ title, slug, topic, author, readTime, cover, summary, sections: [{ title, content }] }`

- [x] **Step 1: Create `blog_data.json` with 3 high-tech initial dummy posts**
- [x] **Step 2: Implement `api/admin.js` for token generation and passcode validation**
- [x] **Step 3: Implement `api/blogs.js` with GET, POST, PUT, DELETE operations**
- [x] **Step 4: Extend `api/team.js` with POST/PUT/DELETE for regular team members**
- [x] **Step 5: Extend `api/projects.js` with POST/PUT/DELETE for projects**
- [x] **Step 6: Write test script `tests/api_blogs.test.js` and verify all endpoints return 200/401 correctly**
- [x] **Step 7: Commit backend foundation**

```bash
git add blog_data.json api/admin.js api/blogs.js api/team.js api/projects.js tests/api_blogs.test.js
git commit -m "feat(api): add blog, admin auth, and cms endpoints"
```

---

### Task 2: Server Routing & Vercel Configuration

**Files:**
- Modify: `server.js`
- Modify: `vercel.json`

**Interfaces:**
- `/enigma-admin` ➔ `public/enigma-admin.html`
- `/blog` ➔ `public/blog.html`
- `/blog/:slug` ➔ `public/blog-post.html`

- [x] **Step 1: Add `/blog`, `/blog/:slug`, `/enigma-admin`, and `/api/blogs`, `/api/admin` routes to `server.js`**
- [x] **Step 2: Update `vercel.json` rewrites for the new routes**
- [x] **Step 3: Test local server routing with curl/fetch**
- [x] **Step 4: Commit server and routing updates**

```bash
git add server.js vercel.json
git commit -m "feat(routes): configure express and vercel routes for blog and admin"
```

---

### Task 3: Public Blog Showcase (`public/blog.html`)

**Files:**
- Create: `public/blog.html`
- Modify: `public/js/common.js`

**Interfaces:**
- Consumes: `GET /api/blogs`
- Produces: Visual grid with topic pills, GSAP FLIP animation, Three.js 3D flow background, and Barba navigation to `/blog/:slug`.

- [x] **Step 1: Create `public/blog.html` with cyber-grid structure, header, filter bar, and cards container**
- [x] **Step 2: Implement Three.js 3D interactive particle flow background**
- [x] **Step 3: Implement kinetic typography entry reveal using GSAP**
- [x] **Step 4: Implement GSAP FLIP shuffle logic for dynamic topic pills**
- [x] **Step 5: Implement 3D mouse parallax tilt on blog cards**
- [x] **Step 6: Add navbar links to Blog across main pages**
- [x] **Step 7: Test interactive filtering, responsive design, and Barba transitions**
- [x] **Step 8: Commit public blog showcase**

```bash
git add public/blog.html public/js/common.js
git commit -m "feat(blog): create awwwards-grade blog showcase with gsap flip and three.js"
```

---

### Task 4: Dedicated Article Reader (`public/blog-post.html`)

**Files:**
- Create: `public/blog-post.html`
- Modify: `public/js/common.js`

**Interfaces:**
- Consumes: `GET /api/blogs?slug=:slug`
- Produces: Article reader with reading progress bar, floating bullet HUD, ScrollSpy, and smooth GSAP scrollTo navigation.

- [x] **Step 1: Create `public/blog-post.html` with 2-column layout (content + sticky HUD)**
- [x] **Step 2: Implement dynamic article fetcher based on URL slug**
- [x] **Step 3: Implement reading progress bar at top of viewport**
- [x] **Step 4: Implement floating bullet point HUD with timeline line and glowing nodes**
- [x] **Step 5: Implement ScrollSpy using IntersectionObserver/GSAP to track active bullet point**
- [x] **Step 6: Implement smooth glide on bullet point click with target highlight pulse**
- [x] **Step 7: Implement mobile floating drawer HUD for smaller screens**
- [x] **Step 8: Test reader with all 3 dummy blog posts and verify back-navigation**
- [x] **Step 9: Commit dedicated article reader**

```bash
git add public/blog-post.html public/js/common.js
git commit -m "feat(blog-post): create dedicated article reader with floating bullet scrollspy"
```

---

### Task 5: Secret Cyber-Admin Portal (`public/enigma-admin.html`)

**Files:**
- Create: `public/enigma-admin.html`

**Interfaces:**
- Consumes: `/api/admin/login`, `/api/blogs`, `/api/team`, `/api/projects`
- Produces: Terminal login gate and 3-tab CMS (Dispatches, Operatives, Initiatives).

- [x] **Step 1: Create `public/enigma-admin.html` with sci-fi terminal login screen**
- [x] **Step 2: Implement passcode authentication against `/api/admin/login` and session storage**
- [x] **Step 3: Implement Dispatches tab with Section Block Builder (Section Title = Bullet point, Section Content = Body)**
- [x] **Step 4: Implement Operatives tab (add/edit regular members across batch_2026/2027/2028 with Firestore sync)**
- [x] **Step 5: Implement Initiatives tab (add/edit/delete projects)**
- [x] **Step 6: Test admin operations: create test post, verify bullet points appear in reader, verify Firestore sync**
- [x] **Step 7: Commit secret admin portal**

```bash
git add public/enigma-admin.html
git commit -m "feat(admin): build secret /enigma-admin portal with cyber terminal and cms tabs"
```

---

### Task 6: End-to-End System Verification & Polish

**Files:**
- Create: `tests/e2e_verification.js`
- Test: All routes and operations

- [x] **Step 1: Run comprehensive e2e test script validating all blog and admin flows**
- [x] **Step 2: Verify local server running and visual presentation**
- [x] **Step 3: Commit final verification and clean up temporary test files**

```bash
git add tests/e2e_verification.js
git commit -m "test: add comprehensive e2e verification suite for blog and admin"
```
