// --- EXPANDING 3D FOOTER LOGIC ---
window.footerExpandingReqId = null;
window.footerExpandingMouse = { x: 0, y: 0 };

window.initExpandingFooter = function () {
    const container = document.getElementById("footer-canvas");
    const footerElement = document.querySelector("footer");
    
    if (!container || !footerElement || typeof THREE === 'undefined' || typeof gsap === 'undefined') return;

    window.cleanupExpandingFooter(); // ensure clean state

    const scene = new THREE.Scene();
    window.footerExpandingScene = scene;
    
    const camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    window.footerExpandingCamera = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    window.footerExpandingRenderer = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight);

    const mouseHandler = (e) => {
        window.footerExpandingMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        window.footerExpandingMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", mouseHandler);
    window.footerExpandingMouseHandler = mouseHandler;

    const geometry = new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    const model = new THREE.Mesh(geometry, material);
    scene.add(model);

    let modelBaseRotationX = 0.5;
    let modelBaseZ = -1;

    const footerContainer = document.querySelector(".footer-container");
    gsap.set(footerContainer, { yPercent: -50 });

    const trigger = ScrollTrigger.create({
        trigger: footerElement,
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
            const progress = self.progress;
            const yValue = -50 * (1 - progress);
            gsap.set(footerContainer, { yPercent: yValue });
            modelBaseZ = -5 + (progress * 5); 
            modelBaseRotationX = 0.5 + (progress * 0.5);
        }
    });
    window.footerExpandingScrollTrigger = trigger;

    function animate() {
        window.footerExpandingReqId = requestAnimationFrame(animate);

        const targetRotationY = window.footerExpandingMouse.x * 0.5;
        const targetRotationX = (-window.footerExpandingMouse.y * 0.5) + modelBaseRotationX;

        model.rotation.y += (targetRotationY - model.rotation.y) * 0.05;
        model.rotation.x += (targetRotationX - model.rotation.x) * 0.05;
        model.position.z += (modelBaseZ - model.position.z) * 0.05;

        renderer.render(scene, camera);
    }
    animate();

    const resizeHandler = () => {
        if (!container) return;
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    };
    window.addEventListener("resize", resizeHandler);
    window.footerExpandingResizeHandler = resizeHandler;
};

window.cleanupExpandingFooter = function () {
    if (window.footerExpandingReqId) {
        cancelAnimationFrame(window.footerExpandingReqId);
        window.footerExpandingReqId = null;
    }
    if (window.footerExpandingScrollTrigger) {
        window.footerExpandingScrollTrigger.kill();
        window.footerExpandingScrollTrigger = null;
    }
    if (window.footerExpandingMouseHandler) {
        window.removeEventListener('mousemove', window.footerExpandingMouseHandler);
        window.footerExpandingMouseHandler = null;
    }
    if (window.footerExpandingResizeHandler) {
        window.removeEventListener('resize', window.footerExpandingResizeHandler);
        window.footerExpandingResizeHandler = null;
    }
    if (window.footerExpandingRenderer) {
        window.footerExpandingRenderer.dispose();
        const container = document.getElementById("footer-canvas");
        if (container) container.innerHTML = '';
        window.footerExpandingRenderer = null;
    }
    if (window.footerExpandingScene) {
        window.footerExpandingScene.clear();
        window.footerExpandingScene = null;
    }
};
