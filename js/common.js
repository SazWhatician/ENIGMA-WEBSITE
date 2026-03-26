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
    document.body.style.overflow = 'hidden';

    const canvasArea = document.getElementById('tv-canvas-area');
    const canvas = document.getElementById('tv-canvas');
    if (!canvas || !canvasArea || typeof THREE === 'undefined') return;

    // --- THREE.JS SCENE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(50, canvasArea.clientWidth / canvasArea.clientHeight, 0.1, 500);
    camera.position.set(0, 2, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvasArea.clientWidth, canvasArea.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(3, 8, 10);
    scene.add(dirLight);
    const greenGlow = new THREE.PointLight(0x2BA648, 3, 30);
    greenGlow.position.set(0, 5, 8);
    scene.add(greenGlow);
    const tvGlow = new THREE.PointLight(0x2BA648, 0, 20);
    tvGlow.position.set(0, 0, 6);
    scene.add(tvGlow);

    const textureLoader = new THREE.TextureLoader();

    // --- CRT TV (centered) ---
    const tvGroup = new THREE.Group();
    scene.add(tvGroup);
    tvGroup.add(new THREE.Mesh(new THREE.BoxGeometry(13, 10, 7), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.7, metalness: 0.3 })));
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(11.5, 8.2, 0.6), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 }));
    bezel.position.z = 3.55;
    tvGroup.add(bezel);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.05, metalness: 0.9, emissive: 0x050505 });
    const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.5), screenMat);
    tvScreen.position.z = 3.86;
    tvGroup.add(tvScreen);
    const cdSlot = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 0.4), new THREE.MeshBasicMaterial({ color: 0x2BA648, wireframe: true }));
    cdSlot.position.set(0, -4.3, 3.6);
    tvGroup.add(cdSlot);
    // Antennas
    const antMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8 });
    const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 8), antMat);
    a1.position.set(-2, 7, -1); a1.rotation.z = -0.3; tvGroup.add(a1);
    const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.5, 8), antMat);
    a2.position.set(2, 6.8, -1); a2.rotation.z = 0.25; tvGroup.add(a2);
    tvGroup.position.set(0, 0, 0);

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -6; scene.add(floor);

    // --- CURSOR TRACKING ---
    let mouseNX = 0, mouseNY = 0;
    window.tvCursorMove = (e) => {
        const rect = canvasArea.getBoundingClientRect();
        mouseNX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseNY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    canvasArea.addEventListener('mousemove', window.tvCursorMove);

    // --- BUILD CDs (hidden, spawned on folder hover) ---
    const cds = [];
    brutalEventsData.forEach((ev, i) => {
        const cdGroup = new THREE.Group();
        const cdGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.1, 48);
        const tex = textureLoader.load(ev.img);
        const matSide = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.15 });
        const matTop = new THREE.MeshBasicMaterial({ map: tex });
        const matBot = new THREE.MeshBasicMaterial({ map: tex }); // IMAGE ON BOTH SIDES
        cdGroup.add(new THREE.Mesh(cdGeo, [matSide, matTop, matBot]));
        cdGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16), new THREE.MeshBasicMaterial({ color: 0x000000 })));
        cdGroup.position.set(0, -15, 8);
        cdGroup.rotation.x = Math.PI / 2;
        cdGroup.visible = false;
        cdGroup.userData = { eventData: ev, index: i, texture: tex };
        scene.add(cdGroup);
        cds.push(cdGroup);
    });

    // --- HTML ALBUM COVER FOLDERS ---
    const folderDock = document.getElementById('folder-dock');
    let selectedCD = null, hoveredFolderIdx = -1, isTransitioning = false;

    if (folderDock) {
        folderDock.innerHTML = '';
        brutalEventsData.forEach((ev, i) => {
            const f = document.createElement('div');
            f.setAttribute('data-idx', i);
            f.style.cssText = 'flex-shrink:0; width:140px; height:180px; background:linear-gradient(145deg,#1a1a1a,#0a0a0a); border:1px solid rgba(43,166,72,0.3); border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; padding:10px 8px; cursor:pointer; transition:all 0.3s; position:relative; overflow:visible;';

            const thumb = document.createElement('div');
            thumb.style.cssText = "width:120px; height:110px; background:url('" + ev.img + "') center/cover; border:1px solid rgba(255,255,255,0.1); border-radius:3px; position:absolute; top:8px; left:50%; transform:translateX(-50%);";
            f.appendChild(thumb);

            const name = document.createElement('div');
            name.style.cssText = "font-family:'Syncopate',sans-serif; font-size:0.55rem; letter-spacing:1px; color:rgba(255,255,255,0.8); text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; margin-top:auto;";
            name.innerText = ev.title;
            f.appendChild(name);

            f.addEventListener('mouseenter', () => {
                if (isTransitioning || selectedCD) return;
                hoveredFolderIdx = i;
                f.style.borderColor = '#2BA648';
                f.style.boxShadow = '0 0 20px rgba(43,166,72,0.3)';
                f.style.transform = 'translateY(-8px)';
                const cd = cds[i];
                cd.visible = true;
                const rect = f.getBoundingClientRect();
                const cr = canvasArea.getBoundingClientRect();
                const nx = ((rect.left + rect.width / 2 - cr.left) / cr.width - 0.5) * 20;
                cd.position.set(nx, -6, 8);
                gsap.to(cd.position, { y: 1, duration: 0.6, ease: 'back.out(1.7)' });
            });

            f.addEventListener('mouseleave', () => {
                if (selectedCD === cds[i]) return;
                f.style.borderColor = 'rgba(43,166,72,0.3)';
                f.style.boxShadow = 'none';
                f.style.transform = 'translateY(0)';
                const cd = cds[i];
                gsap.to(cd.position, { y: -15, duration: 0.4, ease: 'power2.in', onComplete: () => { if (selectedCD !== cd) cd.visible = false; } });
                hoveredFolderIdx = -1;
            });

            f.addEventListener('click', () => {
                if (isTransitioning || selectedCD) return;
                isTransitioning = true;
                selectedCD = cds[i];
                const tl = gsap.timeline();
                tl.to(selectedCD.position, { x: 0, y: -4.3, z: 6, duration: 0.8, ease: 'power2.inOut' })
                  .to(selectedCD.rotation, { x: Math.PI / 2, y: 0, z: 0, duration: 0.8 }, '<')
                  .to(selectedCD.position, { z: 3.6, duration: 0.4, ease: 'power1.in' })
                  .to(selectedCD.position, { y: -15, duration: 0.1 })
                  .call(() => {
                      tvGlow.intensity = 8;
                      tvScreen.material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: selectedCD.userData.texture });
                      const btn = document.getElementById('btn-enter-event');
                      gsap.to(btn, { opacity: 1, pointerEvents: 'auto', duration: 0.5 });
                      isTransitioning = false;
                  });
            });

            folderDock.appendChild(f);
        });
    }

    // --- INITIALIZE BUTTON ---
    const enterBtn = document.getElementById('btn-enter-event');
    if (enterBtn) {
        enterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!selectedCD) return;
            isTransitioning = true;
            gsap.to(enterBtn, { opacity: 0, pointerEvents: 'none', duration: 0.3 });
            gsap.to(camera.position, { x: 0, y: 0, z: 4, duration: 1.5, ease: 'expo.in' });
            gsap.to(document.getElementById('tv-events-container'), { opacity: 0, duration: 0.5, delay: 1.2 });
            setTimeout(() => { openDetailView(selectedCD.userData.eventData, document.body); }, 1400);
        });
    }

    // --- RESET SCENE ---
    window.tvResetScene = () => {
        if (!selectedCD) return;
        gsap.to(camera.position, { x: 0, y: 2, z: 16, duration: 1.5, ease: 'expo.out' });
        gsap.to(document.getElementById('tv-events-container'), { opacity: 1, duration: 0.5 });
        tvGlow.intensity = 0;
        tvScreen.material = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.05, metalness: 0.9, emissive: 0x050505 });
        selectedCD.visible = false;
        selectedCD = null;
        isTransitioning = false;
    };

    // --- ANIMATION LOOP ---
    window.tvReqId = null;
    function animateTV() {
        if (!document.getElementById('tv-canvas')) { if (window.tvReqId) cancelAnimationFrame(window.tvReqId); return; }
        window.tvReqId = requestAnimationFrame(animateTV);
        tvGroup.rotation.y += (mouseNX * 0.15 - tvGroup.rotation.y) * 0.08;
        tvGroup.rotation.x += (-mouseNY * 0.08 - tvGroup.rotation.x) * 0.08;
        if (hoveredFolderIdx >= 0 && cds[hoveredFolderIdx] && cds[hoveredFolderIdx].visible && cds[hoveredFolderIdx] !== selectedCD) {
            cds[hoveredFolderIdx].rotation.z += 0.015;
        }
        renderer.render(scene, camera);
    }
    animateTV();

    // --- RESIZE ---
    window.tvResize = () => {
        if (!camera || !renderer || !canvasArea) return;
        camera.aspect = canvasArea.clientWidth / canvasArea.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasArea.clientWidth, canvasArea.clientHeight);
    };
    window.addEventListener('resize', window.tvResize);

    window.addEventListener('resize', window.tvResize);

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
                    // Trigger the 3D scene reset
                    if(window.tvResetScene) window.tvResetScene();
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
            const eventDataObj = brutalEventsData.find(ed => {
                const edDate = new Date(ed.date);
                return edDate.getFullYear() === year && edDate.getMonth() === month && edDate.getDate() === i;
            });
            const hasEvent = !!eventDataObj;
            const dataIndex = brutalEventsData.indexOf(eventDataObj);
            
            const className = hasEvent ? 'cal-day has-event' : 'cal-day';
            const clickEvent = hasEvent ? `onclick="window.openDetailViewForCal(${dataIndex})"` : '';
            calGrid.insertAdjacentHTML('beforeend', `<div class="${className}" ${clickEvent} data-cursor-hover>${i}</div>`);
        }
        
    }

    // Expose openDetailView to global scope so inline onclick can access it
    window.openDetailViewForCal = function(index) {
        const calendarModal = document.getElementById('cyber-calendar-modal');
        if (calendarModal) {
            calendarModal.classList.remove('active');
        }
        setTimeout(() => {
            const data = brutalEventsData[index];
            if (data) {
                // mock origin card for the visual flow
                const mockObj = document.createElement('div');
                openDetailView(data, mockObj);
            }
        }, 400); // Wait for modal to close
    };

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
