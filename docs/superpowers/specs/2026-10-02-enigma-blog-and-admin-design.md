# Specification: ENIGMA Blog Subsystem & Secret Cyber-Admin Portal

**Date:** 2026-10-02  
**Status:** Approved for Implementation  
**Theme:** Cyberpunk / Deep Void Black (`#000000`), Neon Grid (`#2BA648`), Awwwards-Grade Motion & 3D Visuals  

---

## 1. Overview & Goals
ENIGMA needs a high-end, immersive **Blog Platform** that matches the cinematic, futuristic identity of the website, alongside a **Secret Admin Portal** (`/enigma-admin`) to empower admins to dynamically publish blogs, manage team members across batches, and update project showcases without manual file editing.

### Key Objectives
1. **Public Blog Showcase (`/blog`)**: An Awwwards-level page featuring a 3D Three.js flow backdrop, kinetic typography reveal, dynamic topic filtering, and a buttery-smooth GSAP FLIP shuffle animation.
2. **Dedicated Post Page (`/blog/:slug`)**: A distraction-free, cinematic article reader featuring an interactive right-hand floating HUD with scrollspy bullet points, smooth section jumping, and reading progress indicators.
3. **Secret Cyber-Admin Portal (`/enigma-admin`)**: A sci-fi terminal login screen leading into a full CMS to:
   - Create, edit, and delete blog posts with a section block builder (where each section title defines a bullet point in the article's navigation index).
   - Add, edit, and remove regular team members across batches (`batch_2026`, `batch_2027`, `batch_2028`, etc.) with live Firestore sync.
   - Add, edit, and remove projects.
4. **Resilient Backend & Cloud Sync**:
   - Vercel serverless functions in `api/` (`blogs.js`, `admin.js`, plus updates to `team.js` and `projects.js`).
   - Firestore database persistence with local JSON fallbacks (`blog_data.json`, `team_data.json`, `project_data.json`).
   - Clean dynamic routing via `vercel.json` and Express `server.js`.

---

## 2. Public Blog Showcase (`public/blog.html`)

### 2.1 Visual Design & 3D Flow Animation
- **3D Canvas (`#blog-canvas`)**:
  - Built with Three.js.
  - Features an interactive floating cybernetic lattice / vector field with particles that gently distort and wave based on mouse velocity and scroll speed.
  - Color palette: Deep obsidian `#000000`, emerald neon `#2BA648`, subtle cyber teal `#0df2c9`, and low-opacity blueprint lines.
- **Page Entrance & Reveal**:
  - Integrates with Barba.js (`data-barba-namespace="blog"`).
  - Kinetic split-text typography for the header: `ENIGMA // DISPATCHES`, with staggered letter slide-up and faint glitch scanlines.
  - Subtitle typing effect: `DECODED TRANSMISSIONS FROM THE DIGITAL FRONTIER`.

### 2.2 Topic Filtering & Fluid FLIP Shuffle
- **Topic Filter Bar**:
  - Filter pills dynamically generated from available post topics (e.g. `ALL`, `AI/ML`, `CYBERSECURITY`, `SYSTEMS`, `WEB3`, etc.).
  - Active pill highlighted with glowing neon outline and cyber bracket indicators `[ AI/ML ]`.
- **GSAP FLIP Shuffle**:
  - When a topic is selected, card positions are recorded (`getBoundingClientRect`).
  - Active cards glide with high-tension spring physics into their new grid locations.
  - Non-matching cards fade out with slight scale-down and blur.
  - Staggered re-entry creates a tactile, responsive feel.

### 2.3 Blog Cards
- **Card Anatomy**:
  - Glassmorphic backdrop (`rgba(10, 10, 10, 0.7)` with `backdrop-filter: blur(12px)`).
  - High-res cover image with subtle zoom on hover.
  - Topic badge with glowing dot indicator.
  - Title in `Cinzel` / `Syncopate` headers.
  - Excerpt with character truncation.
  - Metadata row: Author name, publication date, and estimated reading time.
  - Interactive 3D mouse parallax tilt on hover (using CSS transform perspective).
  - Click transitions smoothly into the dedicated post page via Barba.js.

---

## 3. Dedicated Article Reader (`public/blog-post.html`)

### 3.1 Routing & URL Scheme
- URL: `/blog/:slug` (e.g., `/blog/neural-lattice-architectures`).
- Rewritten in `vercel.json` and `server.js` to serve `public/blog-post.html`.
- On page load, extracts `:slug` from the pathname (or `?slug=` parameter) and fetches article data from `/api/blogs?slug=:slug`.

### 3.2 Visual Structure
- **Reading Progress HUD**: A slim neon line at the very top of the viewport reflecting exact scroll percentage (`0%` to `100%`).
- **Hero Header**:
  - Category pill + date + read time.
  - Massive editorial heading with neon accents.
  - Author operative badge with avatar and handle.
  - Wide cinematic hero image with bottom gradient blend.
- **Article Body Layout (2-Column on Desktop)**:
  - **Left / Main Column (75%)**: The article content broken into modular sections (headings, paragraphs, blockquotes, code snippets, inline callouts).
  - **Right Column (25% Sticky Floating HUD)**:
    - Dedicated Bullet Point Navigator.
    - Title: `TRANSMISSION INDEX`.
    - Vertical timeline line with glowing bullet markers for each section heading.
    - **ScrollSpy**: Active section dot expands into a glowing diamond / pulsing ring as user scrolls past that section.
    - **Smooth Glide**: Clicking any bullet point smoothly scrolls the page directly to that section with a brief highlight pulse.
  - **Mobile Responsive Drawer**: On screens `< 1024px`, the index collapses into a sleek floating button that opens a cyber HUD bottom sheet.
- **Footer Navigation**:
  - Back to all dispatches button with cursor warp effect.
  - Share article transmission button (copies URL to clipboard with terminal toast notification).

---

## 4. Secret Admin Portal (`public/enigma-admin.html`)

### 4.1 Route & Authentication
- URL: `/enigma-admin`.
- **Cyberpunk Terminal Login Gate**:
  - Monospace green terminal with system boot logs (`INITIALIZING KERNEL... AUTH PROTOCOL 0x7E`).
  - Input: Security Passcode (hidden input with blinking cursor).
  - Authenticates via `/api/admin` against `ADMIN_PASSCODE` in environment (defaults to `enigma2026`).
  - On success, issues a temporary session token saved in `sessionStorage` and animates the terminal out to reveal the CMS workspace.

### 4.2 CMS Dashboard Capabilities

#### A. Dispatches (Blog CMS)
- **List View**: Table/cards of all published and draft articles with search, topic filter, edit button, and delete confirmation modal.
- **Section Block Editor**:
  - Post Title, URL Slug (auto-derived with manual override), Topic Tag, Author, Cover Image URL / Path, Read Time.
  - **Modular Section Builder**:
    - Admin can `+ Add Section`.
    - Each section has a **Section Heading** (this automatically becomes the right-hand bullet point in the reader!) and **Section Content** (supports markdown, code blocks, quote callouts, images).
    - Drag / move up / move down buttons to reorder sections.
    - Live Article Preview modal.
    - Save as Draft or Publish immediately.

#### B. Operatives (Team Management)
- **Add / Edit Regular Members**:
  - Name, Role (e.g. "Core Developer", "UI/UX Lead").
  - Batch / Year dropdown: `batch_2026`, `batch_2027`, `batch_2028`, `Alumni`, or custom year.
  - Image Path / URL (e.g., `./team-assets/batch_2028/your-photo.jpg` or HTTPS URL).
  - Social Links: LinkedIn, GitHub, Instagram.
  - **Special Card Safeguard**: The interface clearly indicates: *"Special card animations (Apex, Devcard) are hardcoded in engine logic. Regular cards are dynamically updated here."*
  - Instant live write to Firestore collection `team_members` and local `team_data.json`.

#### C. Initiatives (Project Management)
- **Add / Edit Projects**:
  - Project Title, Description, Image URL/path, Project URL.
  - Reorder, update, or remove projects.
  - Instant live write to Firestore collection `projects` and local `project_data.json`.

---

## 5. Backend Architecture & Endpoints

### 5.1 Endpoints
1. `api/admin.js`:
   - `POST /api/admin/login`: Verifies passcode, returns `{ success: true, token }`.
   - `POST /api/admin/verify`: Validates current token.
2. `api/blogs.js`:
   - `GET /api/blogs`: Returns all published blogs (or all if admin).
   - `GET /api/blogs?slug=:slug`: Returns full blog with sections.
   - `POST /api/blogs`: Creates blog post (requires admin token).
   - `PUT /api/blogs`: Updates existing blog (requires admin token).
   - `DELETE /api/blogs`: Deletes blog post (requires admin token).
3. `api/team.js`:
   - `GET /api/team`: Unchanged (returns team array).
   - `POST /api/team`: Creates new member (requires admin token).
   - `PUT /api/team`: Updates existing member (requires admin token).
   - `DELETE /api/team`: Removes member (requires admin token).
4. `api/projects.js`:
   - `GET /api/projects`: Unchanged.
   - `POST /api/projects`: Creates project (requires admin token).
   - `PUT /api/projects`: Updates project (requires admin token).
   - `DELETE /api/projects`: Removes project (requires admin token).

### 5.2 Server & Vercel Routing
- `server.js`:
  - `app.get('/blog', ...)` ➔ `public/blog.html`
  - `app.get('/blog/:slug', ...)` ➔ `public/blog-post.html`
  - `app.get('/enigma-admin', ...)` ➔ `public/enigma-admin.html`
  - API routes mapped to `api/*.js` modules.
- `vercel.json`:
  ```json
  { "src": "/enigma-admin", "dest": "/public/enigma-admin.html" },
  { "src": "/blog", "dest": "/public/blog.html" },
  { "src": "/blog/(.*)", "dest": "/public/blog-post.html" }
  ```

---

## 6. Seed Data (3 High-Tech Test Blogs)
To immediately test filters, shuffle animations, and section bullet navigation, the system will be seeded with 3 comprehensive articles:

1. **"Neural Lattice Architectures: Beyond the Transformer Paradigm"**
   - **Topic**: `AI/ML`
   - **Slug**: `neural-lattice-architectures`
   - **Author**: *ENIGMA Research Lab*
   - **Read Time**: `6 min`
   - **Sections / Bullets**:
     1. The Limits of Quadratic Attention
     2. Sparse Graph Diffusion & State Spaces
     3. Sub-Quadratic Scaling Benchmarks
     4. Implementation in PyTorch & Triton
     5. Future Directives for Edge Neural Chips

2. **"Quantum-Resilient Cryptosystems & Zero-Knowledge Enclaves"**
   - **Topic**: `CYBERSECURITY`
   - **Slug**: `quantum-resilient-cryptosystems`
   - **Author**: *Cyber Warfare Wing*
   - **Read Time**: `8 min`
   - **Sections / Bullets**:
     1. Post-Quantum Lattice Threats
     2. Kyber & Dilithium Protocol Analysis
     3. Zero-Knowledge Proofs in Enclaves
     4. Memory Hardening & Side-Channel Mitigation
     5. Verification & Threat Vectors

3. **"High-Throughput Distributed Microkernels in Rust & WebAssembly"**
   - **Topic**: `SYSTEMS`
   - **Slug**: `distributed-microkernels-wasm`
   - **Author**: *Core Infrastructure Cell*
   - **Read Time**: `5 min`
   - **Sections / Bullets**:
     1. Decoupled Memory Isolation
     2. Asynchronous Event-Driven IO
     3. WASM Component Model in Production
     4. Real-World Concurrency Benchmarks
     5. Architectural Conclusions

---

## 7. Testing & Verification Checklist
- [ ] `/blog` renders with Three.js 3D flow canvas and Awwwards-style typography reveal.
- [ ] Topic filter buttons shuffle blog cards with smooth GSAP FLIP physics.
- [ ] Clicking a blog post routes cleanly to `/blog/:slug` with Barba.js transition.
- [ ] Dedicated article page shows sticky right-hand bullet navigator with ScrollSpy highlighting active section.
- [ ] Clicking any bullet smoothly glides to that section.
- [ ] `/enigma-admin` opens the cyber terminal, accepts passcode, and unlocks the CMS.
- [ ] Admin can add, edit, and delete blogs, team members, and projects with immediate Firestore & local fallback persistence.
- [ ] Mobile responsive layout verified for reader HUD and admin dashboard.
