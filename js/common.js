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

// --- LIQUID PORTAL WEBGL BACKGROUND ---
window.initEventsLiquid = function () {
    window.cleanupEventsLiquid();

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

    const canvasContainer = document.getElementById('liquid-portal-canvas');
    const eventsContainer = document.getElementById('liquid-events-container');
    
    if (!canvasContainer || !eventsContainer) return;

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

    eventsContainer.innerHTML = '';
    eventsContainer.style.height = `${eventsData.length * 100}vh`;

    eventsData.forEach((ev, i) => {
        const el = document.createElement('div');
        el.className = 'liquid-event-sect';
        el.style.position = 'absolute';
        el.style.top = `${i * 100}vh`;
        el.style.width = '100%';
        el.style.height = '100vh';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.pointerEvents = 'none';

        el.innerHTML = `<h2 style="font-family: 'Syncopate', sans-serif; font-size: clamp(2rem, 8vw, 8rem); font-weight: 700; color: white; mix-blend-mode: difference; text-transform: uppercase; margin: 0; pointer-events: auto; cursor: crosshair; text-align: center;" class="liq-evt-title">${ev.title}</h2><p style="font-family: 'Host Grotesk', sans-serif; font-size: clamp(1rem, 2vw, 1.5rem); color: #2BA648; font-weight: 700; margin-top: -1rem; pointer-events: auto; background: black; padding: 0.2rem 1rem; border-radius: 4px;">${ev.date}</p>`;
        eventsContainer.appendChild(el);
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    canvasContainer.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    let textures = eventsData.map(ev => textureLoader.load(ev.img));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTexture1: { value: textures[0] },
            uTexture2: { value: textures[1] },
            uTransition: { value: 0 },
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uHover: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture1;
            uniform sampler2D uTexture2;
            uniform float uTransition;
            uniform float uTime;
            uniform vec2 uResolution;
            uniform vec2 uMouse;
            uniform float uHover;
            varying vec2 vUv;

            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,  0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;  x12.xy -= i1;  i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;   g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                float screenAspect = uResolution.x / uResolution.y;
                float imgAspect = 16.0 / 9.0;
                vec2 uv = vUv;
                if(screenAspect > imgAspect) {
                    uv.y = (uv.y - 0.5) * (imgAspect / screenAspect) + 0.5;
                } else {
                    uv.x = (uv.x - 0.5) * (screenAspect / imgAspect) + 0.5;
                }

                float dist = distance(vUv, uMouse);
                float mouseDisplace = smoothstep(0.4, 0.0, dist) * 0.15 * uHover;
                vec2 dir = normalize(vUv - uMouse);
                if (length(dir) == 0.0) dir = vec2(1.0, 0.0);
                vec2 mouseOffset = dir * mouseDisplace;

                float noise = snoise(vUv * 3.0 + uTime * 0.2);
                float disp1 = noise * uTransition * 0.6;
                float disp2 = noise * (1.0 - uTransition) * 0.6;
                
                vec2 uv1 = uv + vec2(disp1) + mouseOffset;
                vec2 uv2 = uv - vec2(disp2) + mouseOffset;
                
                float rgbSplit = uTransition * (1.0 - uTransition) * 0.1;
                
                vec4 c1 = texture2D(uTexture1, vec2(uv1.x + rgbSplit, uv1.y));
                vec4 c2 = texture2D(uTexture1, vec2(uv1.x, uv1.y));
                vec4 c3 = texture2D(uTexture1, vec2(uv1.x - rgbSplit, uv1.y));
                vec4 color1 = vec4(c1.r, c2.g, c3.b, 1.0);

                vec4 c4 = texture2D(uTexture2, vec2(uv2.x + rgbSplit, uv2.y));
                vec4 c5 = texture2D(uTexture2, vec2(uv2.x, uv2.y));
                vec4 c6 = texture2D(uTexture2, vec2(uv2.x - rgbSplit, uv2.y));
                vec4 color2 = vec4(c4.r, c5.g, c6.b, 1.0);
                
                vec4 blended = mix(color1, color2, clamp(uTransition + noise*0.2, 0.0, 1.0));
                
                blended.rgb *= 0.7;
                gl_FragColor = blended;
            }
        `
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(plane);

    window.liquidMouseTarget = new THREE.Vector2(0.5, 0.5);
    window.liquidMouseCurrent = new THREE.Vector2(0.5, 0.5);

    window.liquidMouseMove = (e) => {
        window.liquidMouseTarget.x = e.clientX / window.innerWidth;
        window.liquidMouseTarget.y = 1.0 - (e.clientY / window.innerHeight);
    };
    document.addEventListener('mousemove', window.liquidMouseMove);

    const titles = document.querySelectorAll('.liq-evt-title');
    titles.forEach(t => {
        t.addEventListener('mouseenter', () => gsap.to(material.uniforms.uHover, { value: 1, duration: 0.8, ease: "power2.out" }));
        t.addEventListener('mouseleave', () => gsap.to(material.uniforms.uHover, { value: 0, duration: 0.8, ease: "power2.out" }));
    });

    window.liquidReqId = null;
    function animateLiquid() {
        if (!document.getElementById('liquid-portal-canvas')) return;
        window.liquidReqId = requestAnimationFrame(animateLiquid);
        
        material.uniforms.uTime.value += 0.01;
        
        window.liquidMouseCurrent.lerp(window.liquidMouseTarget, 0.1);
        material.uniforms.uMouse.value.copy(window.liquidMouseCurrent);

        renderer.render(scene, camera);
    }
    animateLiquid();

    window.liquidResizeHandler = () => {
        if (!document.getElementById('liquid-portal-canvas')) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', window.liquidResizeHandler);

    window.liquidScrollTrigger = ScrollTrigger.create({
        trigger: eventsContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
            let maxIndex = eventsData.length - 1;
            if(maxIndex < 1) return;
            let progress = self.progress * maxIndex;
            progress = Math.max(0, Math.min(progress, maxIndex));
            
            let i = Math.floor(progress);
            let f = progress - i;
            let nextI = Math.min(i + 1, maxIndex);
            
            material.uniforms.uTexture1.value = textures[i] || textures[0];
            material.uniforms.uTexture2.value = textures[nextI] || textures[0];
            material.uniforms.uTransition.value = f;
        }
    });

    if(window.liquidScrollTrigger) window.liquidScrollTrigger.update(0);
};

window.cleanupEventsLiquid = function () {
    if (window.liquidScrollTrigger) { window.liquidScrollTrigger.kill(); window.liquidScrollTrigger = null; }
    if (window.eventsLenisTicker) { gsap.ticker.remove(window.eventsLenisTicker); window.eventsLenisTicker = null; }
    if (window.eventsLenis) { window.eventsLenis.destroy(); window.eventsLenis = null; }
    if (typeof ScrollTrigger !== 'undefined') { ScrollTrigger.getAll().forEach(t => { if (t.vars.trigger === '#liquid-events-container') t.kill(); }); }
    
    if (window.liquidReqId) { cancelAnimationFrame(window.liquidReqId); window.liquidReqId = null; }
    if (window.liquidResizeHandler) { window.removeEventListener('resize', window.liquidResizeHandler); window.liquidResizeHandler = null; }
    if (window.liquidMouseMove) { document.removeEventListener('mousemove', window.liquidMouseMove); window.liquidMouseMove = null; }
    
    const canvasContainer = document.getElementById('liquid-portal-canvas');
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
                    window.initEventsLiquid();
                },
                afterEnter() { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); },
                beforeLeave() {
                    window.cleanupEventsLiquid();
                },
                beforeOnce(data) {
                    document.body.style.overflowY = 'auto';
                    document.body.style.touchAction = 'auto';
                    window.initEventsLiquid();
                }
            ,
                beforeEnter(data) {
                    document.body.style.overflowY = 'auto';
                    document.body.style.touchAction = 'auto';
                    window.initEventsLiquid();
                },
                afterEnter() { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); },
                beforeLeave() {
                    window.cleanupEventsLiquid();
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
