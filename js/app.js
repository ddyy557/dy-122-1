class ProductViewer {
    constructor() {
        this.container = document.getElementById('canvasContainer');
        this.canvas = document.getElementById('productCanvas');
        this.loading = document.getElementById('loading');
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.shoe = null;
        this.shoeMaterials = {};
        
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotationVelocity = { x: 0, y: 0 };
        this.targetRotation = { x: 0.2, y: 0.5 };
        this.currentRotation = { x: 0.2, y: 0.5 };
        
        this.autoRotate = false;
        this.autoRotateSpeed = 0.005;
        
        this.cameraDistance = 5;
        this.minDistance = 2.5;
        this.maxDistance = 10;
        
        this.colors = {
            black: {
                upper: 0x1a1a1a,
                sole: 0x2d2d2d,
                accent: 0x444444,
                name: '经典黑'
            },
            blue: {
                upper: 0x4a6fa5,
                sole: 0x3a5a8a,
                accent: 0x6a8fc5,
                name: '灰蓝色'
            },
            white: {
                upper: 0xf5f5f5,
                sole: 0xe0e0e0,
                accent: 0xcccccc,
                name: '珍珠白'
            },
            red: {
                upper: 0xc94c4c,
                sole: 0xa03c3c,
                accent: 0xe06060,
                name: '烈焰红'
            },
            green: {
                upper: 0x6b8e23,
                sole: 0x556b2f,
                accent: 0x8fbc3f,
                name: '橄榄绿'
            }
        };
        
        this.currentColor = 'black';
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createGround();
        this.createShoe();
        this.setupEventListeners();
        this.animate();
        
        setTimeout(() => {
            this.loading.classList.add('hidden');
        }, 800);
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
        this.scene.fog = new THREE.Fog(0x0f172a, 8, 20);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(0, 1.5, this.cameraDistance);
        this.camera.lookAt(0, 0.5, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 8, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 30;
        mainLight.shadow.camera.left = -8;
        mainLight.shadow.camera.right = 8;
        mainLight.shadow.camera.top = 8;
        mainLight.shadow.camera.bottom = -8;
        this.scene.add(mainLight);
        
        const fillLight = new THREE.DirectionalLight(0x667eea, 0.3);
        fillLight.position.set(-4, 3, -3);
        this.scene.add(fillLight);
        
        const rimLight = new THREE.DirectionalLight(0x764ba2, 0.4);
        rimLight.position.set(-3, 5, -5);
        this.scene.add(rimLight);
        
        const pointLight = new THREE.PointLight(0x667eea, 0.5, 10);
        pointLight.position.set(2, 3, 3);
        this.scene.add(pointLight);
    }
    
    createGround() {
        const groundGeometry = new THREE.CircleGeometry(6, 64);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        const ringGeometry = new THREE.RingGeometry(3, 3.2, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x667eea,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -0.49;
        this.scene.add(ring);
    }
    
    createShoe() {
        this.shoe = new THREE.Group();
        
        const upperMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors[this.currentColor].upper,
            roughness: 0.4,
            metalness: 0.05,
            clearcoat: 0.15,
            clearcoatRoughness: 0.4
        });
        
        const soleMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors[this.currentColor].sole,
            roughness: 0.8,
            metalness: 0.05
        });
        
        const accentMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors[this.currentColor].accent,
            roughness: 0.25,
            metalness: 0.4,
            clearcoat: 0.6,
            clearcoatRoughness: 0.25
        });
        
        const midSoleMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xf0f0f0,
            roughness: 0.5,
            metalness: 0.02
        });
        
        this.shoeMaterials.upper = upperMaterial;
        this.shoeMaterials.sole = soleMaterial;
        this.shoeMaterials.accent = accentMaterial;
        this.shoeMaterials.midSole = midSoleMaterial;
        
        const soleShape = new THREE.Shape();
        soleShape.moveTo(-1.4, 0.12);
        soleShape.bezierCurveTo(-1.4, 0.28, -1.1, 0.38, -0.7, 0.38);
        soleShape.lineTo(0.9, 0.38);
        soleShape.bezierCurveTo(1.2, 0.38, 1.5, 0.28, 1.5, 0.12);
        soleShape.bezierCurveTo(1.5, -0.02, 1.2, -0.12, 0.9, -0.12);
        soleShape.lineTo(-0.7, -0.12);
        soleShape.bezierCurveTo(-1.1, -0.12, -1.4, -0.02, -1.4, 0.12);
        
        const outSoleGeometry = new THREE.ExtrudeGeometry(soleShape, {
            depth: 0.28,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.04,
            bevelSegments: 3
        });
        const outSole = new THREE.Mesh(outSoleGeometry, soleMaterial);
        outSole.rotation.x = -Math.PI / 2;
        outSole.position.z = -0.14;
        outSole.position.y = 0;
        outSole.castShadow = true;
        outSole.receiveShadow = true;
        this.shoe.add(outSole);
        
        const midSoleShape = new THREE.Shape();
        midSoleShape.moveTo(-1.3, 0.11);
        midSoleShape.bezierCurveTo(-1.3, 0.25, -1.05, 0.34, -0.65, 0.34);
        midSoleShape.lineTo(0.85, 0.34);
        midSoleShape.bezierCurveTo(1.15, 0.34, 1.4, 0.25, 1.4, 0.11);
        midSoleShape.bezierCurveTo(1.4, -0.01, 1.15, -0.1, 0.85, -0.1);
        midSoleShape.lineTo(-0.65, -0.1);
        midSoleShape.bezierCurveTo(-1.05, -0.1, -1.3, -0.01, -1.3, 0.11);
        
        const midSoleGeometry = new THREE.ExtrudeGeometry(midSoleShape, {
            depth: 0.32,
            bevelEnabled: true,
            bevelThickness: 0.06,
            bevelSize: 0.06,
            bevelSegments: 4
        });
        const midSole = new THREE.Mesh(midSoleGeometry, midSoleMaterial);
        midSole.rotation.x = -Math.PI / 2;
        midSole.position.z = -0.16;
        midSole.position.y = 0.25;
        midSole.scale.set(0.97, 0.97, 1);
        midSole.castShadow = true;
        this.shoe.add(midSole);
        
        const upperShape = new THREE.Shape();
        upperShape.moveTo(-1.15, 0);
        upperShape.bezierCurveTo(-1.3, 0.25, -1.1, 0.55, -0.6, 0.65);
        upperShape.lineTo(-0.1, 0.62);
        upperShape.bezierCurveTo(0.2, 0.58, 0.5, 0.5, 0.8, 0.38);
        upperShape.bezierCurveTo(1.05, 0.28, 1.2, 0.1, 1.15, 0);
        upperShape.bezierCurveTo(0.9, -0.08, -0.9, -0.08, -1.15, 0);
        
        const upperGeometry = new THREE.ExtrudeGeometry(upperShape, {
            depth: 0.55,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 5
        });
        const upper = new THREE.Mesh(upperGeometry, upperMaterial);
        upper.rotation.x = -Math.PI / 2;
        upper.position.y = 0.5;
        upper.position.z = -0.275;
        upper.castShadow = true;
        upper.receiveShadow = true;
        this.shoe.add(upper);
        
        const toeShape = new THREE.Shape();
        toeShape.moveTo(0.6, 0);
        toeShape.bezierCurveTo(1.0, 0, 1.25, 0.15, 1.2, 0.32);
        toeShape.bezierCurveTo(1.1, 0.42, 0.75, 0.48, 0.4, 0.42);
        toeShape.lineTo(0.4, 0);
        toeShape.lineTo(0.6, 0);
        
        const toeGeometry = new THREE.ExtrudeGeometry(toeShape, {
            depth: 0.52,
            bevelEnabled: true,
            bevelThickness: 0.08,
            bevelSize: 0.08,
            bevelSegments: 4
        });
        const toeCap = new THREE.Mesh(toeGeometry, accentMaterial);
        toeCap.rotation.x = -Math.PI / 2;
        toeCap.position.y = 0.52;
        toeCap.position.z = -0.26;
        toeCap.castShadow = true;
        this.shoe.add(toeCap);
        
        const heelShape = new THREE.Shape();
        heelShape.moveTo(-1.0, 0.08);
        heelShape.bezierCurveTo(-1.2, 0.08, -1.3, 0.28, -1.15, 0.48);
        heelShape.bezierCurveTo(-1.0, 0.58, -0.65, 0.55, -0.45, 0.48);
        heelShape.lineTo(-0.45, 0.08);
        heelShape.lineTo(-1.0, 0.08);
        
        const heelGeometry = new THREE.ExtrudeGeometry(heelShape, {
            depth: 0.52,
            bevelEnabled: true,
            bevelThickness: 0.06,
            bevelSize: 0.06,
            bevelSegments: 3
        });
        const heelCounter = new THREE.Mesh(heelGeometry, accentMaterial);
        heelCounter.rotation.x = -Math.PI / 2;
        heelCounter.position.y = 0.52;
        heelCounter.position.z = -0.26;
        heelCounter.castShadow = true;
        this.shoe.add(heelCounter);
        
        const heelTabGeometry = new THREE.BoxGeometry(0.12, 0.3, 0.4);
        const heelTab = new THREE.Mesh(heelTabGeometry, accentMaterial);
        heelTab.position.set(-1.1, 0.95, 0);
        heelTab.castShadow = true;
        this.shoe.add(heelTab);
        
        for (let i = 0; i < 7; i++) {
            const eyeletGeometry = new THREE.TorusGeometry(0.028, 0.012, 8, 16);
            const eyelet = new THREE.Mesh(eyeletGeometry, accentMaterial);
            eyelet.rotation.y = Math.PI / 2;
            eyelet.position.set(-0.3 + i * 0.22, 0.92, 0.27);
            eyelet.castShadow = true;
            this.shoe.add(eyelet);
            
            const eyelet2 = eyelet.clone();
            eyelet2.position.z = -0.27;
            eyelet2.rotation.y = -Math.PI / 2;
            this.shoe.add(eyelet2);
        }
        
        const laceMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.55,
            metalness: 0.02
        });
        
        for (let i = 0; i < 6; i++) {
            const laceGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.6, 8);
            const lace = new THREE.Mesh(laceGeometry, laceMaterial);
            lace.rotation.z = Math.PI / 2;
            lace.rotation.y = (i - 2.5) * 0.08;
            lace.position.set(-0.2 + i * 0.22, 0.9, 0);
            lace.castShadow = true;
            this.shoe.add(lace);
        }
        
        const tongueShape = new THREE.Shape();
        tongueShape.moveTo(-0.25, 0.45);
        tongueShape.bezierCurveTo(-0.15, 0.5, 0.15, 0.5, 0.25, 0.45);
        tongueShape.lineTo(0.3, 1.0);
        tongueShape.bezierCurveTo(0.2, 1.08, -0.2, 1.08, -0.3, 1.0);
        tongueShape.lineTo(-0.25, 0.45);
        
        const tongueGeometry = new THREE.ExtrudeGeometry(tongueShape, {
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.04,
            bevelSize: 0.04,
            bevelSegments: 3
        });
        const tongue = new THREE.Mesh(tongueGeometry, upperMaterial);
        tongue.rotation.x = -Math.PI / 2;
        tongue.position.y = 0.55;
        tongue.position.z = -0.15;
        tongue.rotation.z = 0.05;
        tongue.castShadow = true;
        this.shoe.add(tongue);
        
        const swooshShape = new THREE.Shape();
        swooshShape.moveTo(-0.8, 0.2);
        swooshShape.bezierCurveTo(-0.4, 0.42, 0.1, 0.35, 0.7, 0.2);
        swooshShape.bezierCurveTo(0.6, 0.15, 0.1, 0.28, -0.8, 0.16);
        swooshShape.lineTo(-0.8, 0.2);
        
        const swooshGeometry = new THREE.ExtrudeGeometry(swooshShape, {
            depth: 0.04,
            bevelEnabled: true,
            bevelThickness: 0.015,
            bevelSize: 0.015,
            bevelSegments: 2
        });
        const swoosh = new THREE.Mesh(swooshGeometry, accentMaterial);
        swoosh.rotation.x = -Math.PI / 2;
        swoosh.position.y = 0.6;
        swoosh.position.z = 0.25;
        swoosh.castShadow = true;
        this.shoe.add(swoosh);
        
        const swoosh2 = swoosh.clone();
        swoosh2.position.z = -0.29;
        swoosh2.scale.z = -1;
        this.shoe.add(swoosh2);
        
        for (let i = 0; i < 12; i++) {
            const treadGeometry = new THREE.BoxGeometry(0.08, 0.1, 0.22);
            const tread = new THREE.Mesh(treadGeometry, soleMaterial);
            tread.position.set(-1.0 + i * 0.19, -0.05, 0);
            tread.rotation.x = (Math.random() - 0.5) * 0.3;
            tread.castShadow = true;
            this.shoe.add(tread);
        }
        
        for (let i = 0; i < 3; i++) {
            const stripeGeometry = new THREE.BoxGeometry(0.02, 0.35, 0.58);
            const stripe = new THREE.Mesh(stripeGeometry, accentMaterial);
            stripe.position.set(0.2 + i * 0.15, 0.65, 0);
            stripe.castShadow = true;
            this.shoe.add(stripe);
        }
        
        const ankleCollarShape = new THREE.Shape();
        ankleCollarShape.moveTo(-0.9, 0.35);
        ankleCollarShape.bezierCurveTo(-0.8, 0.55, -0.3, 0.55, -0.1, 0.5);
        ankleCollarShape.lineTo(-0.1, 0.42);
        ankleCollarShape.bezierCurveTo(-0.3, 0.48, -0.75, 0.45, -0.85, 0.3);
        ankleCollarShape.lineTo(-0.9, 0.35);
        
        const ankleCollarGeometry = new THREE.ExtrudeGeometry(ankleCollarShape, {
            depth: 0.6,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 3
        });
        const ankleCollar = new THREE.Mesh(ankleCollarGeometry, accentMaterial);
        ankleCollar.rotation.x = -Math.PI / 2;
        ankleCollar.position.y = 0.75;
        ankleCollar.position.z = -0.3;
        ankleCollar.castShadow = true;
        this.shoe.add(ankleCollar);
        
        this.shoe.position.y = 0;
        this.shoe.rotation.y = 0.5;
        this.shoe.scale.set(1.1, 1.1, 1.1);
        
        this.scene.add(this.shoe);
    }
    
    changeColor(colorName) {
        if (!this.colors[colorName]) return;
        
        this.currentColor = colorName;
        const colors = this.colors[colorName];
        
        this.animateColor(this.shoeMaterials.upper, colors.upper);
        this.animateColor(this.shoeMaterials.sole, colors.sole);
        this.animateColor(this.shoeMaterials.accent, colors.accent);
        
        document.getElementById('colorName').textContent = colors.name;
    }
    
    animateColor(material, targetColorHex) {
        const targetColor = new THREE.Color(targetColorHex);
        const startColor = material.color.clone();
        const duration = 500;
        const startTime = Date.now();
        
        const updateColor = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            material.color.lerpColors(startColor, targetColor, eased);
            
            if (progress < 1) {
                requestAnimationFrame(updateColor);
            }
        };
        
        updateColor();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        document.addEventListener('touchend', () => this.onTouchEnd());
        
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
        
        window.addEventListener('resize', () => this.onResize());
        
        document.getElementById('resetView').addEventListener('click', () => this.resetView());
        
        const autoRotateBtn = document.getElementById('autoRotate');
        autoRotateBtn.addEventListener('click', () => {
            this.autoRotate = !this.autoRotate;
            autoRotateBtn.classList.toggle('active', this.autoRotate);
        });
        
        document.getElementById('zoomIn').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('zoomOut').addEventListener('click', () => this.zoom(1.25));
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.changeColor(btn.dataset.color);
            });
        });
        
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
        this.rotationVelocity = { x: 0, y: 0 };
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaMove = {
            x: e.clientX - this.previousMousePosition.x,
            y: e.clientY - this.previousMousePosition.y
        };
        
        this.targetRotation.y += deltaMove.x * 0.01;
        this.targetRotation.x += deltaMove.y * 0.01;
        this.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.x));
        
        this.rotationVelocity = {
            x: deltaMove.y * 0.002,
            y: deltaMove.x * 0.002
        };
        
        this.previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const deltaMove = {
            x: e.touches[0].clientX - this.previousMousePosition.x,
            y: e.touches[0].clientY - this.previousMousePosition.y
        };
        
        this.targetRotation.y += deltaMove.x * 0.01;
        this.targetRotation.x += deltaMove.y * 0.01;
        this.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.x));
        
        this.previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1.1 : 0.9;
        this.zoom(delta);
    }
    
    zoom(factor) {
        this.cameraDistance *= factor;
        this.cameraDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.cameraDistance));
    }
    
    resetView() {
        this.targetRotation = { x: 0.2, y: 0.5 };
        this.currentRotation = { x: 0.2, y: 0.5 };
        this.rotationVelocity = { x: 0, y: 0 };
        this.cameraDistance = 5;
    }
    
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.autoRotate && !this.isDragging) {
            this.targetRotation.y += this.autoRotateSpeed;
        }
        
        if (!this.isDragging) {
            this.targetRotation.y += this.rotationVelocity.y;
            this.targetRotation.x += this.rotationVelocity.x;
            this.targetRotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetRotation.x));
            
            this.rotationVelocity.x *= 0.95;
            this.rotationVelocity.y *= 0.95;
        }
        
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.1;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.1;
        
        if (this.shoe) {
            this.shoe.rotation.y = this.currentRotation.y;
            this.shoe.rotation.x = this.currentRotation.x;
        }
        
        this.camera.position.z = this.cameraDistance;
        this.camera.position.y = 1.5 + Math.sin(this.currentRotation.x) * 1;
        this.camera.lookAt(0, 0.5, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProductViewer();
});
