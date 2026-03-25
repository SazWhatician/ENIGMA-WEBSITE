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

// --- BRUTALIST EVENTS JS ENGINE ---
const brutalEventsData = [
    { id: '01', title: "DevTalk 2026", date: "MAR 10, 2026", img: "image-assets/1b7c273b460fa68f0e4e9476f1fdfa8b.jpg", status: "ONLINE", desc: "A deep dive into advanced frontend architecture and state management paradigms." },
    { id: '02', title: "Induction 2026", date: "FEB 22, 2026", img: "image-assets/bd6172951c03813bdf043d30bb63c737.jpg", status: "ACCESS GRANTED", desc: "Initiation protocol for new recruits. System access levels will be distributed." },
    { id: '03', title: "AI/ML SUMMIT", date: "JAN 15, 2026", img: "image-assets/aiml.jpg", status: "COMPUTING", desc: "Neural network optimization and predictive modeling workshops with industry leads." },
    { id: '04', title: "Hackathon", date: "DEC 05, 2025", img: "image-assets/cubers.jpg", status: "LIVE", desc: "48-hour continuous coding sprint. Create solutions. Break systems. Build them better." },
    { id: '05', title: "Fifa Tournament", date: "NOV 20, 2025", img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2670", status: "OFFLINE", desc: "Tactical simulation engine testing via competitive electronic sports." },
    { id: '06', title: "CP CONTEST", date: "OCT 12, 2025", img: "image-assets/cp.jpg", status: "ARCHIVED", desc: "Algorithmic optimization and competitive problem solving under extreme time constraints." },
    { id: '07', title: "APP DEV WEEK", date: "SEP 08, 2025", img: "./image-assets/59e1b74783bbaf6b4ea5b0058a0c51dd.jpg", status: "ARCHIVED", desc: "Cross-platform mobile application development using cutting-edge frameworks." },
    { id: '08', title: "UI/UX WORKSHOP", date: "AUG 14, 2025", img: "image-assets/1b7c273b460fa68f0e4e9476f1fdfa8b.jpg", status: "ARCHIVED", desc: "Human-computer interaction design principles and brutalist aesthetic theory." }
];

window.initEventsBrutalist = function () {
    window.cleanupEventsBrutalist();

    // 1. Smooth scroll setup
    if (typeof Lenis !== 'undefined') {
        window.eventsLenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        window.eventsLenis.on('scroll', ScrollTrigger.update);
        window.eventsLenisTicker = (time) => {
            if (window.eventsLenis) window.eventsLenis.raf(time * 1000);
        };
        gsap.ticker.add(window.eventsLenisTicker);
        gsap.ticker.lagSmoothing(0);
    }

    // 2. Custom Cursor (Removed to match project aesthetics)

    // --- 3D INTRO ANIMATION ---
    const introCanvas = document.getElementById('intro-canvas');
    if (introCanvas && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.05);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ canvas: introCanvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 3000;
        const posArray = new Float32Array(particlesCount * 3);
        const colorArray = new Float32Array(particlesCount * 3);

        const color1 = new THREE.Color(0x2BA648);
        const color2 = new THREE.Color(0xffffff);

        for(let i = 0; i < particlesCount * 3; i+=3) {
            const radius = 8 + (Math.random() - 0.5) * 4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
            posArray[i+1] = radius * Math.sin(phi) * Math.sin(theta);
            posArray[i+2] = radius * Math.cos(phi);

            const mixedColor = color1.clone().lerp(color2, Math.random());
            colorArray[i] = mixedColor.r;
            colorArray[i+1] = mixedColor.g;
            colorArray[i+2] = mixedColor.b;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleMesh);

        const sphereGeom = new THREE.SphereGeometry(6, 32, 32);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0x0F3918,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        scene.add(sphere);

        let mouseX = 0;
        let mouseY = 0;
        
        window.introMouseMove = (e) => {
            mouseX = (e.clientX - window.innerWidth / 2);
            mouseY = (e.clientY - window.innerHeight / 2);
        };
        document.addEventListener('mousemove', window.introMouseMove);

        window.introResize = () => {
            if (!camera || !renderer) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', window.introResize);

        function animateIntro() {
            if (!document.getElementById('intro-canvas')) {
                if (window.introReqId) cancelAnimationFrame(window.introReqId);
                return;
            }
            window.introReqId = requestAnimationFrame(animateIntro);

            let targetX = mouseX * 0.001;
            let targetY = mouseY * 0.001;

            particleMesh.rotation.y += 0.002;
            particleMesh.rotation.x += 0.001;

            particleMesh.rotation.y += 0.05 * (targetX - particleMesh.rotation.y);
            particleMesh.rotation.x += 0.05 * (targetY - particleMesh.rotation.x);
            
            sphere.rotation.y -= 0.004;
            sphere.rotation.z -= 0.002;

            renderer.render(scene, camera);
        }
        animateIntro();
    }

    // Fade in text for Intro
    gsap.fromTo(".capsule-intro .fade-in-up", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: "power3.out", delay: 0.5 }
    );

    // 3. Render Cards
    const grid = document.getElementById('brutal-events-grid');
    if (grid) {
        grid.innerHTML = '';
        brutalEventsData.forEach((ev, i) => {
            const padId = String(ev.id).padStart(2, '0');
            const padTotal = String(brutalEventsData.length).padStart(2, '0');
            const cardHtml = `
                <div class="dossier-card" data-id="${i}">
                    <div class="card-img-wrap">
                        <img src="${ev.img}" class="card-img" alt="${ev.title}" loading="lazy">
                        <div class="card-overlay"></div>
                    </div>
                    <div class="card-content">
                        <div class="card-content-top">
                            <div class="title-wrap">
                                <h2 class="card-title">${ev.title}</h2>
                                <div class="card-date">${ev.date}</div>
                            </div>
                            <div class="card-status">${ev.status}</div>
                        </div>
                        <div class="card-content-bottom">
                            <p class="card-desc">${ev.desc}</p>
                            <div class="card-counter">
                                <span class="count-current">${padId}</span>
                                <span class="count-total">/ ${padTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    // 4. Hero Marquee Animation (Removed)

    // 5. Scramble Effect
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-/\\|<>[]{}()";
    
    function scrambleText(element) {
        if(element.classList.contains('scrambled')) return;
        element.classList.add('scrambled');
        const originalText = element.innerText;
        let iteration = 0;
        
        clearInterval(element.scrambleInterval);
        element.scrambleInterval = setInterval(() => {
            element.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) return originalText[index];
                    if (letter === " ") return " ";
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");
            
            if (iteration >= originalText.length) {
                clearInterval(element.scrambleInterval);
            }
            iteration += 1 / 3;
        }, 30);
    }

    // Decode text on load
    setTimeout(() => {
        document.querySelectorAll('.decode-text').forEach(el => scrambleText(el));
    }, 500);

    // 6. Sticky Cols Animation
    if (typeof SplitText !== 'undefined') {
        const textElements = document.querySelectorAll(".col-3 h1, .col-3 p");
        textElements.forEach((element) => {
            const split = new SplitText(element, { type: "lines", linesClass: "line" });
            split.lines.forEach((line) => (line.innerHTML = `<span>${line.textContent}</span>`));
        });
        gsap.set(".col-3 .col-content-wrapper .line span", { y: "0%" });
        gsap.set(".col-3 .col-content-wrapper-2 .line span", { y: "-125%" });
    }

    let currentPhase = 0;

    ScrollTrigger.create({
        trigger: ".sticky-cols",
        start: "top top",
        end: `+=${window.innerHeight * 4}px`,
        pin: true,
        pinSpacing: true,

        onUpdate: (self) => {
            const progress = self.progress;

            // Phase 1
            if (progress >= 0.25 && currentPhase === 0) {
                currentPhase = 1;
                gsap.to(".col-1", { opacity: 0, scale: 0.75, duration: 0.75 });
                gsap.to(".col-2", { x: "0%", duration: 0.75 });
                gsap.to(".col-3", { y: "0%", duration: 0.75 });
                gsap.to(".col-img-1 img", { scale: 1.25, duration: 0.75 });
                gsap.to(".col-img-2", { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.75 });
                gsap.to(".col-img-2 img", { scale: 1, duration: 0.75 });
            }

            // Phase 2
            if (progress >= 0.5 && currentPhase === 1) {
                currentPhase = 2;
                gsap.to(".col-2", { opacity: 0, scale: 0.75, duration: 0.75 });
                gsap.to(".col-3", { x: "0%", duration: 0.75 });
                gsap.to(".col-4", { y: "0%", duration: 0.75 });
                gsap.to(".col-3 .col-content-wrapper .line span", { y: "-125%", duration: 0.75 });
                gsap.to(".col-3 .col-content-wrapper-2 .line span", { y: "0%", duration: 0.75, delay: 0.5 });
            }

            // Reverse Phase 2 → 1
            if (progress < 0.5 && currentPhase === 2) {
                currentPhase = 1;
                gsap.to(".col-2", { opacity: 1, scale: 1, duration: 0.75 });
                gsap.to(".col-3", { x: "100%", duration: 0.75 });
                gsap.to(".col-4", { y: "100%", duration: 0.75 });
                gsap.to(".col-3 .col-content-wrapper .line span", { y: "0%", duration: 0.75, delay: 0.5 });
                gsap.to(".col-3 .col-content-wrapper-2 .line span", { y: "-125%", duration: 0.75 });
            }

            // Reverse Phase 1 → 0
            if (progress < 0.25 && currentPhase === 1) {
                currentPhase = 0;
                gsap.to(".col-1", { opacity: 1, scale: 1, duration: 0.75 });
                gsap.to(".col-2", { x: "100%", duration: 0.75 });
                gsap.to(".col-3", { y: "100%", duration: 0.75 });
                gsap.to(".col-img-1 img", { scale: 1, duration: 0.75 });
                gsap.to(".col-img-2", { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: 0.75 });
                gsap.to(".col-img-2 img", { scale: 1.25, duration: 0.75 });
            }
        },
    });

    // Card scroll reveal
    const cards = document.querySelectorAll('.dossier-card');
    cards.forEach((card, i) => {
        gsap.set(card, { y: 80, opacity: 0, scale: 0.95 });
        ScrollTrigger.create({
            trigger: card,
            start: "top 85%",
            onEnter: () => {
                gsap.to(card, { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" });
            }
        });

        card.addEventListener('click', () => {
            const dataIndex = card.getAttribute('data-id');
            const data = brutalEventsData[dataIndex];
            openDetailView(data, card);
        });
    });

    // 8. Detail View Logic
    const detailView = document.getElementById('dossier-detail');
    const btnCloseDetail = document.getElementById('btn-close-detail');
    const detailImg = document.getElementById('detail-img-node');
    const detailTitle = document.getElementById('detail-title-node');
    const detailDate = document.getElementById('detail-date-node');
    const detailDesc = document.getElementById('detail-desc-node');

    function openDetailView(data, originCard) {
        if(window.eventsLenis) window.eventsLenis.stop();
        document.body.style.overflow = 'hidden';
        
        detailImg.src = data.img;
        detailTitle.innerText = data.title;
        detailDate.innerText = data.date;
        detailDesc.innerText = data.desc;
        detailTitle.classList.remove('scrambled');

        gsap.set(detailView, { opacity: 0, pointerEvents: 'auto' });
        gsap.set(detailImg, { scale: 1.2, filter: 'grayscale(100%)' });
        gsap.set('.detail-content > *', { y: 30, opacity: 0 });
        
        const tl = gsap.timeline();
        tl.to(detailView, { opacity: 1, duration: 0.4, ease: "power2.inOut" })
          .to(detailImg, { scale: 1, filter: 'grayscale(0%)', duration: 1, ease: "expo.out" }, "-=0.2")
          .to('.detail-content > *', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "expo.out" }, "-=0.8")
          .call(() => scrambleText(detailTitle), null, "-=0.6");
    }

    if (btnCloseDetail) {
        btnCloseDetail.addEventListener('click', () => {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(detailView, { pointerEvents: 'none' });
                    if(window.eventsLenis) window.eventsLenis.start();
                    document.body.style.overflow = '';
                }
            });
            
            tl.to('.detail-content > *', { y: -20, opacity: 0, duration: 0.3, stagger: -0.05, ease: "power2.in" })
              .to(detailImg, { scale: 1.1, filter: 'grayscale(100%)', duration: 0.4, ease: "power2.inOut" }, 0)
              .to(detailView, { opacity: 0, duration: 0.4, ease: "power2.inOut" }, 0.2);
        });
    }

    // 9. Calendar Logic
    const btnOpenCalendar = document.getElementById('btn-open-calendar');
    const btnCloseCalendar = document.getElementById('btn-close-calendar');
    const calendarModal = document.getElementById('cyber-calendar-modal');
    
    if (btnOpenCalendar && btnCloseCalendar && calendarModal) {
        btnOpenCalendar.addEventListener('click', () => {
            calendarModal.classList.add('active');
            if(window.eventsLenis) window.eventsLenis.stop();
            document.body.style.overflow = 'hidden';
            renderCalendar(currentDate);
        });

        btnCloseCalendar.addEventListener('click', () => {
            calendarModal.classList.remove('active');
            if(window.eventsLenis) window.eventsLenis.start();
            document.body.style.overflow = '';
        });

        // Close on background click
        calendarModal.addEventListener('click', (e) => {
            if (e.target === calendarModal) {
                calendarModal.classList.remove('active');
                if(window.eventsLenis) window.eventsLenis.start();
                document.body.style.overflow = '';
            }
        });
    }

    // Calendar Generation
    const calGrid = document.getElementById('cal-grid');
    const calMonthYear = document.getElementById('cal-month-year');
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');

    // Dates for events to highlight
    const eventDates = brutalEventsData.map(ev => new Date(ev.date));
    let currentDate = new Date(2026, 2, 1); // March 2026

    function renderCalendar(date) {
        if (!calGrid || !calMonthYear) return;
        
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        calMonthYear.innerText = `${monthNames[month]} ${year}`;
        
        calGrid.innerHTML = '';
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            calGrid.insertAdjacentHTML('beforeend', `<div class="cal-day empty"></div>`);
        }
        
        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDayDate = new Date(year, month, i);
            const hasEvent = eventDates.some(ed => 
                ed.getFullYear() === year && 
                ed.getMonth() === month && 
                ed.getDate() === i
            );
            
            const className = hasEvent ? 'cal-day has-event' : 'cal-day';
            calGrid.insertAdjacentHTML('beforeend', `<div class="${className}" data-cursor-hover>${i}</div>`);
        }
        
        // Re-bind cursor hover for new elements (Removed)
    }

    if (calPrev && calNext) {
        calPrev.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });
        
        calNext.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });
    }
};

window.cleanupEventsBrutalist = function () {
    if (window.eventsLenisTicker) { gsap.ticker.remove(window.eventsLenisTicker); window.eventsLenisTicker = null; }
    if (window.eventsLenis) { window.eventsLenis.destroy(); window.eventsLenis = null; }
    if (window.marqueeTl) { window.marqueeTl.kill(); window.marqueeTl = null; }
    
    if (window.introReqId) { cancelAnimationFrame(window.introReqId); window.introReqId = null; }
    if (window.introMouseMove) { document.removeEventListener('mousemove', window.introMouseMove); window.introMouseMove = null; }
    if (window.introResize) { window.removeEventListener('resize', window.introResize); window.introResize = null; }

    // Clear scramblers
    document.querySelectorAll('.decode-text').forEach(el => {
        if(el.scrambleInterval) clearInterval(el.scrambleInterval);
        el.classList.remove('scrambled');
    });

    if (typeof ScrollTrigger !== 'undefined') { 
        ScrollTrigger.getAll().forEach(t => { 
            if (t.vars.trigger) {
                if ((t.vars.trigger.classList && t.vars.trigger.classList.contains('dossier-card')) || t.vars.trigger === '.sticky-cols') {
                    t.kill(); 
                }
            }
        }); 
    }
    
    document.body.style.overflow = '';
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
                     window.initEventsBrutalist();
                 },
                 afterEnter() { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); },
                 beforeLeave() {
                     window.cleanupEventsBrutalist();
                 },
                 beforeOnce(data) {
                     document.body.style.overflowY = 'auto';
                     document.body.style.touchAction = 'auto';
                     window.initEventsBrutalist();
                 },
                 afterOnce() { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); }
            }
        ]
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loading-screen');
    if (loader) { gsap.to(loader, { opacity: 0, duration: 0.5, delay: 0.2, onComplete: () => loader.style.display = 'none' }); }
    window.initBarba();
});
