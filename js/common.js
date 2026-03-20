// --- SHARED GLOBALS & DATA ---
window.projectsData = [];
window.teamData = [];
window.reelTicker = null;
window.boundResize = null;
window.boundWheel = null;
window.boundTouchStart = null;
window.boundTouchMove = null;
window.footerReqId = null;

// --- TEAM LOGIC ---
window.fetchTeam = async function () {
    try {
        const response = await fetch('/api/team?t=' + new Date().getTime());
        if (!response.ok) throw new Error("Team API failed.");
        window.teamData = await response.json();
    } catch (e) {
        console.error("Using fallback team data");
        window.teamData = [{ name: "Saswat Mohanty", role: "Apex", year: "2028", img: "" }];
    }
};

window.renderTeam = function (filterValue, delay = 0) {
    const grid = document.getElementById('team-grid');
    if (!grid) return;
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(st => st.kill());
    }
    grid.innerHTML = '';
    const filteredData = filterValue === 'all' ? window.teamData : window.teamData.filter(m => m.year === filterValue);

    filteredData.forEach(member => {
        const avatarHtml = member.img
            ? `<img src="${encodeURI(member.img)}" class="card-avatar" alt="${member.name}" loading="lazy">`
            : `<div class="card-avatar"></div>`;

        const card = document.createElement('div');
        card.className = `team-card-wrapper`;
        card.innerHTML = `
            <div class="card-inner" onclick="this.parentElement.classList.toggle('flipped')">
                <div class="card-front">
                    ${avatarHtml}
                    <h2>${member.name}</h2>
                    <p>${member.year === 'alumni' ? 'Alumni' : 'Class of ' + member.year}</p>
                </div>
                <div class="card-back">
                    <div class="social-links">
                        <a href="${member.insta || '#'}" target="_blank" onclick="event.stopPropagation()">Instagram</a>
                        <a href="${member.linkedin || '#'}" target="_blank" onclick="event.stopPropagation()">LinkedIn</a>
                        <a href="${member.github || '#'}" target="_blank" onclick="event.stopPropagation()">GitHub</a>
                    </div>
                </div>
            </div>`;
        grid.appendChild(card);
    });
    gsap.fromTo(".team-card-wrapper", { autoAlpha: 0, y: 40, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", stagger: 0.05, delay: delay });
};

window.initFilters = function () {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.onclick = (e) => {
            buttons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            gsap.to(".team-card-wrapper", {
                autoAlpha: 0, y: -20, duration: 0.3, stagger: 0.02, ease: "power2.in",
                onComplete: () => window.renderTeam(e.target.getAttribute('data-filter'), 0)
            });
        };
    });
};

window.animateHero = function (delay = 0) {
    const titleEl = document.getElementById('heroTitle');
    if (!titleEl) return;
    const text = "OUR TEAM";
    titleEl.innerHTML = '';
    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char === ' ' ? '\u00A0' : char;
        titleEl.appendChild(span);
    });

    const letters = titleEl.querySelectorAll('.letter');
    gsap.to(letters, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power4.out",
        delay: delay + 0.2,
        onComplete: () => {
            letters.forEach((l, i) => {
                setTimeout(() => l.classList.add('revealed'), i * 80);
            });
        }
    });

    gsap.to('#heroSubtitle', { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: delay + 0.8 });
    gsap.to('#heroLine', { opacity: 1, scaleX: 1, duration: 0.6, ease: "power2.out", delay: delay + 1 });

    gsap.to('.circuit-line', { strokeDashoffset: 0, duration: 2.5, stagger: 0.15, ease: "power1.inOut", delay: delay + 0.3 });
    gsap.to('.circuit-dot', { opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: delay + 1.2 });
    gsap.to('.circuit-dot', {
        r: 6, opacity: 0.5, duration: 1.5,
        stagger: { each: 0.2, repeat: -1, yoyo: true },
        ease: "sine.inOut", delay: delay + 2
    });
};

// --- PROJECTS LOGIC ---
window.fetchProjects = async function () {
    try {
        const response = await fetch('/api/projects?t=' + new Date().getTime());
        if (!response.ok) throw new Error("API not found.");
        window.projectsData = await response.json();
    } catch (e) {
        window.projectsData = [{ title: "eNIGGmA", desc: "No data found", img: "", link: "#" }];
    }
};

window.cleanupProjectReel = function () {
    if (window.boundResize) window.removeEventListener('resize', window.boundResize);
    if (window.boundWheel) window.removeEventListener('wheel', window.boundWheel);
    if (window.boundTouchStart) window.removeEventListener('touchstart', window.boundTouchStart);
    if (window.boundTouchMove) window.removeEventListener('touchmove', window.boundTouchMove);
    if (window.reelTicker && typeof gsap !== 'undefined') gsap.ticker.remove(window.reelTicker);
};

window.initProjectReel = function (delay = 0) {
    window.cleanupProjectReel();
    const container = document.querySelector('.reel-container');
    if (!container) return;
    container.innerHTML = '';

    const totalProjects = String(window.projectsData.length).padStart(2, '0');

    window.projectsData.forEach((proj, i) => {
        const item = document.createElement('div');
        item.className = 'project-item';
        const projectLink = proj.link || '#';
        item.innerHTML = `
            <div class="project-content">
                <div class="project-counter">${String(i + 1).padStart(2, '0')}<span>/${totalProjects}</span></div>
                <a href="${projectLink}" target="_blank" class="project-image-wrap">
                    <img src="${proj.img}" class="project-image" alt="${proj.title}" loading="lazy">
                </a>
                <div class="project-info">
                    <h2 class="project-title"><a href="${projectLink}" target="_blank">${proj.title}</a></h2>
                    <p class="project-desc">${proj.desc}</p>
                </div>
            </div>`;
        container.appendChild(item);
    });

    const items = document.querySelectorAll('.project-item');
    let windowHeight = window.innerHeight;
    let totalHeight = items.length * windowHeight;
    let y = 0, targetY = 0, touchStartY = 0;

    window.boundResize = () => { windowHeight = window.innerHeight; totalHeight = items.length * windowHeight; };
    window.boundWheel = (e) => { targetY -= e.deltaY * 1.5; };
    window.boundTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    window.boundTouchMove = (e) => { const touchY = e.touches[0].clientY; targetY -= (touchStartY - touchY) * 2.5; touchStartY = touchY; };

    window.addEventListener('resize', window.boundResize);
    window.addEventListener('wheel', window.boundWheel);
    window.addEventListener('touchstart', window.boundTouchStart, { passive: true });
    window.addEventListener('touchmove', window.boundTouchMove, { passive: true });

    window.reelTicker = () => {
        y += (targetY - y) * 0.08;
        items.forEach((item, i) => {
            let offset = (i * windowHeight) + y;
            let wrapped = gsap.utils.wrap(-windowHeight, totalHeight - windowHeight, offset);
            gsap.set(item, { y: wrapped });
            let normalized = wrapped / windowHeight;
            gsap.set(item.querySelector('.project-image'), { y: normalized * 20 + "%" });
            const distFromCenter = Math.abs(normalized);
            if (distFromCenter < 0.3) { item.classList.add('is-active'); } else { item.classList.remove('is-active'); }
            gsap.set(item.querySelector('.project-content'), { opacity: 1 - (distFromCenter * 0.6), scale: 1 - (distFromCenter * 0.1) });
        });
    };
    gsap.ticker.add(window.reelTicker);

    gsap.fromTo('.project-counter', { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power4.out', delay: delay });
    gsap.fromTo('.project-image-wrap', { scale: 0.8, filter: 'blur(10px)', autoAlpha: 0 }, { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: 1.2, ease: 'power3.out', delay: delay + 0.1 });
    gsap.fromTo(['.project-title', '.project-desc'], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: delay + 0.2 });
};

// --- CONTACT LOGIC ---
window.initContactPage = function (delay = 0) {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const btn = document.getElementById('submit-btn');

    if (!form) return;

    gsap.to("#contact-form", { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: delay + 0.5 });
    gsap.fromTo("#contact-title", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: delay + 0.2 });
    gsap.fromTo("#contact-sub", { opacity: 0 }, { opacity: 1, duration: 1, ease: "power3.out", delay: delay + 0.4 });

    form.onsubmit = function (e) {
        e.preventDefault();
        gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
        btn.innerText = "ENCRYPTING DATA...";
        btn.classList.add('animate-pulse');
        btn.disabled = true;

        if (typeof emailjs !== 'undefined') {
            emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
                .then(() => {
                    btn.classList.remove('animate-pulse');
                    let tl = gsap.timeline();
                    tl.to(btn, { opacity: 0, duration: 0.2 })
                        .call(() => {
                            btn.innerText = "TRANSMISSION SUCCESSFUL";
                            btn.style.background = "#2BA648";
                            btn.style.color = "#000";
                            form.reset();
                        })
                        .to(btn, { opacity: 1, duration: 0.4, ease: "power2.out" })
                        .to(status, { opacity: 1, text: "Data received by ENIGMA mainframe.", color: "#2BA648", duration: 0.5 });
                }, (error) => {
                    btn.classList.remove('animate-pulse');
                    btn.innerText = "SYSTEM FAILURE - RETRY";
                    btn.disabled = false;
                    gsap.to(status, { opacity: 1, text: "Error: Connection lost.", color: "red", duration: 0.5 });
                });
        }
    };
};

// --- FOOTER CRYSTAL 3D SCENE ---
window.cleanupFooterCrystal = function () {
    if (window.footerReqId) {
        cancelAnimationFrame(window.footerReqId);
        window.footerReqId = null;
    }
};

window.initFooterCrystal = function () {
    window.cleanupFooterCrystal();
    const footerContainerEl = document.getElementById('footer-canvas');
    if (!footerContainerEl || typeof THREE === 'undefined') return;

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }

    const footerScene = new THREE.Scene();
    footerScene.fog = new THREE.FogExp2(0x000000, 0.1);

    const footerCamera = new THREE.PerspectiveCamera(75, footerContainerEl.offsetWidth / footerContainerEl.offsetHeight, 0.1, 1000);
    footerCamera.position.set(0, 0, 5);
    const footerRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    footerRenderer.setSize(footerContainerEl.offsetWidth, footerContainerEl.offsetHeight);
    footerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    footerRenderer.toneMapping = THREE.ReinhardToneMapping;
    footerContainerEl.innerHTML = '';
    footerContainerEl.appendChild(footerRenderer.domElement);

    footerScene.add(new THREE.AmbientLight(0x000000));

    const pointLight = new THREE.PointLight(0x2BA648, 5, 50);
    pointLight.position.set(0, 0, 0);
    footerScene.add(pointLight);

    const rimLight = new THREE.DirectionalLight(0x185D28, 4);
    rimLight.position.set(5, 5, 5);
    footerScene.add(rimLight);

    const crystalGroup = new THREE.Group();
    footerScene.add(crystalGroup);

    const innerCrystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.2, 0),
        new THREE.MeshStandardMaterial({
            color: 0x2BA648,
            emissive: 0x0F3918,
            emissiveIntensity: 1,
            roughness: 0.1,
            metalness: 0.8
        })
    );
    crystalGroup.add(innerCrystal);

    const outerCage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.6, 0),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.25
        })
    );
    crystalGroup.add(outerCage);

    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(800 * 3);
    for (let i = 0; i < 800 * 3; i++) posArray[i] = (Math.random() - 0.5) * 12;
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particles = new THREE.Points(
        particlesGeo,
        new THREE.PointsMaterial({ size: 0.015, color: 0x2BA648, transparent: true, opacity: 0.6 })
    );
    crystalGroup.add(particles);

    const footerMouse = { x: 0, y: 0 };
    document.querySelector('footer').addEventListener('mousemove', (e) => {
        footerMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        footerMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    const footerContentContainer = document.querySelector('.footer-container');

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: 'footer', start: 'top bottom', end: 'bottom bottom', scrub: true
        });
    }

    const resizeHandler = () => {
        if (!document.getElementById('footer-canvas')) return;
        footerCamera.aspect = footerContainerEl.offsetWidth / footerContainerEl.offsetHeight;
        footerCamera.updateProjectionMatrix();
        footerRenderer.setSize(footerContainerEl.offsetWidth, footerContainerEl.offsetHeight);
    };
    window.addEventListener('resize', resizeHandler);

    function animateFooter() {
        if (!document.getElementById('footer-canvas')) {
            window.cleanupFooterCrystal();
            window.removeEventListener('resize', resizeHandler);
            return;
        }
        window.footerReqId = requestAnimationFrame(animateFooter);
        const time = performance.now() * 0.001;

        innerCrystal.rotation.y += 0.01;
        innerCrystal.rotation.x += 0.005;
        outerCage.rotation.y -= 0.005;
        outerCage.rotation.z += 0.002;
        particles.rotation.y += 0.001;

        const scale = 1 + Math.sin(time * 2) * 0.05;
        innerCrystal.scale.set(scale, scale, scale);

        crystalGroup.rotation.x += (footerMouse.y * 0.2 - crystalGroup.rotation.x) * 0.05;
        crystalGroup.rotation.y += (footerMouse.x * 0.2 - crystalGroup.rotation.y) * 0.05;

        footerRenderer.render(footerScene, footerCamera);
    }
    animateFooter();
};

// --- ENIGMA CORE 3D SCENE & ORBIT GALLERY ---
window.initEventsSpiral = function () {
    window.cleanupEventsSpiral();

    // 1. Smooth scroll setup
    if (typeof Lenis !== 'undefined') {
        window.eventsLenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        window.eventsLenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => window.eventsLenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    const canvasContainer = document.getElementById('enigma-core-canvas');
    const scrollTrack = document.getElementById('events-scroll-track');
    const orbitContainer = document.getElementById('events-orbit-container');
    
    if (!canvasContainer || !scrollTrack || !orbitContainer) return;

    const eventsData = [
        { title: "DevTalk 2026", date: "MAR 10, 2026", img: "image-assets/1b7c273b460fa68f0e4e9476f1fdfa8b.jpg" },
        { title: "Induction 2026", date: "FEB 22, 2026", img: "image-assets/bd6172951c03813bdf043d30bb63c737.jpg" },
        { title: "AI/ML SUMMIT", date: "JAN 15, 2026", img: "image-assets/aiml.jpg" },
        { title: "Hackathon", date: "DEC 05, 2025", img: "image-assets/cubers.jpg" },
        { title: "Fifa Tournament", date: "NOV 20, 2025", img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2670" },
        { title: "CP CONTEST", date: "OCT 12, 2025", img: "image-assets/cp.jpg" },
        { title: "APP DEV WEEK", date: "SEP 08, 2025", img: "./image-assets/59e1b74783bbaf6b4ea5b0058a0c51dd.jpg" },
        { title: "UI/UX WORKSHOP", date: "AUG 14, 2025", img: "image-assets/1b7c273b460fa68f0e4e9476f1fdfa8b.jpg" },
        { title: "TECH SYMPOSIUM", date: "JUL 30, 2025", img: "image-assets/bd6172951c03813bdf043d30bb63c737.jpg" },
        { title: "CODE SPRINT", date: "JUN 15, 2025", img: "image-assets/cp.jpg" }
    ];

    orbitContainer.innerHTML = '';
    
    // 2. Setup Three.js Enigma Core
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth > 768 ? 2 : 1));
    canvasContainer.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0x000000));
    const pointLight = new THREE.PointLight(0x2BA648, 8, 30);
    scene.add(pointLight);

    // The Core Group
    window.enigmaCoreGroup = new THREE.Group();
    scene.add(window.enigmaCoreGroup);

    // Inner Cipher Matrix
    const coreGeo = new THREE.IcosahedronGeometry(2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x185D28,
        emissiveIntensity: 0.8,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const cipherCore = new THREE.Mesh(coreGeo, coreMat);
    window.enigmaCoreGroup.add(cipherCore);

    // Orbiting Data Rings
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x2BA648, wireframe: true, transparent: true, opacity: 0.4 });
    const rings = [];
    for(let i = 1; i <= 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(3 + i * 1.5, 0.05, 8, 64), ringMat);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        rings.push(ring);
        window.enigmaCoreGroup.add(ring);
    }

    // Data Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = window.innerWidth > 768 ? 1200 : 400; // Less particles on mobile
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 25;
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ size: 0.03, color: 0x2BA648, transparent: true, opacity: 0.5 });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    window.enigmaReqId = null;
    let targetCoreRotationY = 0;
    
    function animateCore() {
        if (!document.getElementById('enigma-core-canvas')) return;
        window.enigmaReqId = requestAnimationFrame(animateCore);

        const time = performance.now() * 0.001;
        
        cipherCore.rotation.y += 0.005;
        cipherCore.rotation.x += 0.002;
        
        rings[0].rotation.x += 0.008;
        rings[1].rotation.y -= 0.005;
        rings[2].rotation.z += 0.007;

        particleSystem.rotation.y = time * 0.05;

        // Smoothly interpolate GSAP scroll rotation
        window.enigmaCoreGroup.rotation.y += (targetCoreRotationY - window.enigmaCoreGroup.rotation.y) * 0.1;

        // Glitch scaling effect connected to standard material scale
        const scale = window.enigmaCoreGroup.scale.x;
        // Float softly if not glitched
        if(scale < 1.05) {
            window.enigmaCoreGroup.position.y = Math.sin(time) * 0.3;
        }

        renderer.render(scene, camera);
    }
    animateCore();

    window.coreResizeHandler = () => {
        if (!document.getElementById('enigma-core-canvas')) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', window.coreResizeHandler);

    // 3. Setup Scroll Track & DOM Cards
    // Make track tall enough to scroll through all events
    scrollTrack.style.height = `${(eventsData.length + 1) * 80}vh`;

    const cardsDOM = [];
    const turb = document.getElementById('rippleTurbulence');
    const disp = document.getElementById('rippleDisplacement');

    eventsData.forEach((ev, i) => {
        const card = document.createElement('div');
        card.className = 'orbit-card';
        card.innerHTML = `
            <div class="orbit-image-wrap">
                <img src="${ev.img}" class="orbit-image" alt="${ev.title}" crossorigin="anonymous" />
            </div>
            <div class="orbit-info">
                <h3 class="orbit-title">${ev.title}</h3>
                <p class="orbit-date">${ev.date}</p>
                <a href="#" class="orbit-btn">
                    ENTER SEQUENCE
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
        `;
        orbitContainer.appendChild(card);
        cardsDOM.push(card);

        // Hover Effect: Core Glitch Flash only
        card.addEventListener('mouseenter', () => {
            gsap.to(window.enigmaCoreGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.4, ease: "back.out(1.5)", overwrite: true });
            pointLight.intensity = 15;
            coreMat.emissiveIntensity = 1.5;
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(window.enigmaCoreGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4, overwrite: true });
            pointLight.intensity = 8;
            coreMat.emissiveIntensity = 0.8;
        });

        // Initialize state so they are hidden until first scroll update
        gsap.set(card, { autoAlpha: 0, scale: 0.1 });
    });

    // Orbital Helix Logic
    window.eventsScrollTrigger = ScrollTrigger.create({
        trigger: '#events-scroll-track',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self) => {
            const p = self.progress * eventsData.length;
            
            // Spin the 3D core
            targetCoreRotationY = p * Math.PI * 1.5;

            // Orchestrate the HTML cards
            cardsDOM.forEach((card, i) => {
                const distance = p - i; // 0 = Center Focal Point
                const angle = distance * 1.5; // Spread out orbit
                
                const winW = window.innerWidth;
                const isMobile = winW <= 768;
                
                const radiusX = isMobile ? winW * 0.25 : winW * 0.35;
                const radiusZ = isMobile ? 220 : 300; 
                
                // Helix Coordinates
                const x = Math.sin(angle) * radiusX;
                const z = Math.cos(angle) * radiusZ; 
                const y = -distance * (isMobile ? 180 : 120); // Rise up vertically (push more on mobile)
                
                // Perspective Scaling
                let scale = (z + (isMobile ? 350 : 450)) / (isMobile ? 600 : 750);
                if(scale < 0) scale = 0.01;
                
                const zIndex = Math.floor(z + 1000);
                let opacity = scale * 1.2 - 0.2;
                if(opacity > 1) opacity = 1;
                if(opacity < 0) opacity = 0;
                if(Math.abs(distance) > (isMobile ? 3 : 4)) opacity = 0; // Cull far cards aggressively

                // Highlight focal card
                const isFocal = Math.abs(distance) < 0.5;
                if(isFocal && !card.classList.contains('is-active')) {
                    card.classList.add('is-active');
                } else if(!isFocal && card.classList.contains('is-active')) {
                    card.classList.remove('is-active');
                }

                // ONLY update transforms and opacity to avoid mobile layout thrashing
                gsap.set(card, {
                    x: x,
                    y: y,
                    scale: scale,
                    autoAlpha: opacity,
                    zIndex: zIndex
                });
            });
        }
    });

    // Force initial render frame
    if(window.eventsScrollTrigger) {
        window.eventsScrollTrigger.update(0);
    }

    // --- CYBER CALENDAR LOGIC (Retained from original) ---
    const btnOpen = document.getElementById('btn-open-calendar');
    const btnClose = document.getElementById('btn-close-calendar');
    const modal = document.getElementById('cyber-calendar-modal');
    const grid = document.getElementById('cal-grid');
    const monthYearTxt = document.getElementById('cal-month-year');
    const btnPrev = document.getElementById('cal-prev');
    const btnNext = document.getElementById('cal-next');

    if (btnOpen && modal && grid) {
        let currentDate = new Date(eventsData[0].date);
        if (isNaN(currentDate.getTime())) currentDate = new Date();

        const renderCalendar = (date) => {
            grid.innerHTML = '';
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
            monthYearTxt.textContent = `${monthNames[month]} ${year}`;

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const monthEvents = eventsData.filter(ev => {
                const evDate = new Date(ev.date);
                return evDate.getMonth() === month && evDate.getFullYear() === year;
            });

            for (let i = 0; i < firstDay; i++) {
                const blank = document.createElement('div');
                blank.className = 'cal-day empty';
                grid.appendChild(blank);
            }

            for (let i = 1; i <= daysInMonth; i++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'cal-day';
                dayCell.textContent = i;
                const matchingEvent = monthEvents.find(ev => new Date(ev.date).getDate() === i);
                if (matchingEvent) {
                    dayCell.classList.add('has-event');
                    dayCell.title = matchingEvent.title;
                    dayCell.onclick = () => alert(`RECORDS: Event Details\n\nTitle: ${matchingEvent.title}\nDate: ${matchingEvent.date}\nStatus: UPCOMING`);
                }
                grid.appendChild(dayCell);
            }
        };

        renderCalendar(currentDate);
        btnPrev.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(currentDate); };
        btnNext.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(currentDate); };
        btnOpen.onclick = () => { modal.classList.add('active'); };
        btnClose.onclick = () => { modal.classList.remove('active'); };
        modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
    }
};

window.cleanupEventsSpiral = function () {
    if (window.eventsScrollTrigger) { window.eventsScrollTrigger.kill(); window.eventsScrollTrigger = null; }
    if (window.eventsLenis) { window.eventsLenis.destroy(); window.eventsLenis = null; }
    if (typeof ScrollTrigger !== 'undefined') { ScrollTrigger.getAll().forEach(t => { if (t.vars.trigger === '#events-scroll-track') t.kill(); }); }
    
    // Core Three.js Cleanup
    if (window.enigmaReqId) { cancelAnimationFrame(window.enigmaReqId); window.enigmaReqId = null; }
    if (window.coreResizeHandler) { window.removeEventListener('resize', window.coreResizeHandler); window.coreResizeHandler = null; }
    
    const canvasContainer = document.getElementById('enigma-core-canvas');
    if(canvasContainer) canvasContainer.innerHTML = '';
};

// --- BARBA CORE ---
window.initBarba = function () {
    if (window.barbaInitialized) return;
    window.barbaInitialized = true;

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    barba.init({
        timeout: 5000,
        prevent: ({ el }) => el.hasAttribute('data-barba-prevent') || el.getAttribute('href') === '#',
        transitions: [{
            name: 'fast-panel-wipe',
            leave(data) {
                const done = this.async();
                gsap.to('.transition-panel', { y: '0%', duration: 0.3, stagger: 0.04, ease: 'power2.inOut', onComplete: done });
            },
            enter(data) {
                const done = this.async();
                window.scrollTo(0, 0);

                if (data.current.container) {
                    data.current.container.style.display = 'none';
                }

                const loader = document.getElementById('loading-screen');
                if (loader) loader.style.display = 'none';

                gsap.to('.transition-panel', {
                    y: '-100%', duration: 0.3, stagger: 0.04, ease: 'power2.inOut', onComplete: () => {
                        gsap.set('.transition-panel', { y: '100%' }); done();
                    }
                });
            }
        }],
        views: [
            {
                namespace: 'projects',
                beforeEnter(data) {
                    document.body.style.overflow = 'hidden';
                    document.body.style.touchAction = 'none';
                    const delay = (data.current && data.current.namespace) ? 0.35 : 0;
                    window.fetchProjects().then(() => window.initProjectReel(delay));
                },
                afterEnter() {
                    window.cleanupFooterCrystal();
                },
                beforeLeave() {
                    window.cleanupProjectReel();
                },
                beforeOnce(data) {
                    document.body.style.overflow = 'hidden';
                    document.body.style.touchAction = 'none';
                    window.fetchProjects().then(() => window.initProjectReel(0));
                },
                afterOnce() {
                    window.cleanupFooterCrystal();
                }
            },
            {
                namespace: 'team',
                beforeEnter(data) {
                    document.body.style.overflowY = 'auto';
                    document.body.style.touchAction = 'auto';
                    const delay = (data.current && data.current.namespace) ? 0.35 : 0;
                    window.animateHero(delay);
                    window.fetchTeam().then(() => {
                        window.renderTeam('all', delay + 0.6);
                        window.initFilters();
                    });
                },
                afterEnter() {
                    window.initFooterCrystal();
                },
                beforeLeave() {
                    window.cleanupFooterCrystal();
                },
                beforeOnce(data) {
                    document.body.style.overflowY = 'auto';
                    document.body.style.touchAction = 'auto';
                    window.animateHero(0);
                    window.fetchTeam().then(() => {
                        window.renderTeam('all', 0.6);
                        window.initFilters();
                    });
                },
                afterOnce() {
                    window.initFooterCrystal();
                }
            },
            {
                namespace: 'contact',
                beforeEnter(data) {
                    document.body.style.overflowY = 'auto';
                    document.body.style.touchAction = 'auto';
                    const delay = (data.current && data.current.namespace) ? 0.35 : 0;
                    window.initContactPage(delay);
                },
                afterEnter() {
                    window.initFooterCrystal();
                },
                beforeLeave() {
                    window.cleanupFooterCrystal();
                },
                beforeOnce(data) {
                    document.body.style.overflowY = 'auto';
                    document.body.style.touchAction = 'auto';
                    window.initContactPage(0);
                },
                afterOnce() {
                    window.initFooterCrystal();
                }
            },
            {
                namespace: 'events',
                beforeEnter(data) {
                    document.body.style.overflowY = 'auto';
                    document.body.style.touchAction = 'auto';
                    window.initEventsSpiral();
                },
                beforeLeave() {
                    window.cleanupEventsSpiral();
                },
                beforeOnce(data) {
                    document.body.style.overflowY = 'auto';
                    document.body.style.touchAction = 'auto';
                    window.initEventsSpiral();
                }
            }
        ]
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loading-screen');
    if (loader) { gsap.to(loader, { opacity: 0, duration: 0.5, delay: 0.2, onComplete: () => loader.style.display = 'none' }); }
    window.initBarba();
});
