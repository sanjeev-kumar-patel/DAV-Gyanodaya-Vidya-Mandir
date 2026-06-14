/* ─── 3D Education-Themed Background Module (Three.js) ─── */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    initThreeEduBackground();
  });

  function initThreeEduBackground() {
    const canvas = document.getElementById('three-edu-background-canvas');
    if (!canvas) return;

    // Edge Case: Check for Three.js availability
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Resolving background to fallback gradient.');
      canvas.style.display = 'none';
      return;
    }

    // --- Scene & Camera Config ---
    const scene = new THREE.Scene();
    
    let isDark = document.documentElement.classList.contains('dark');
    scene.background = new THREE.Color(isDark ? 0x0f172a : 0xf8fafc);
    scene.fog = new THREE.FogExp2(isDark ? 0x0f172a : 0xf8fafc, 0.04);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Dynamic Light Settings ---
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.35 : 0.75);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.6 : 0.8);
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    // Glowing colored backlights
    const cyanLight = new THREE.PointLight(0x00f7ff, isDark ? 1.5 : 0.5, 15);
    cyanLight.position.set(-6, 3, -2);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xb980f0, isDark ? 1.5 : 0.5, 15);
    purpleLight.position.set(6, -3, -2);
    scene.add(purpleLight);

    // --- Group for Parallax / Scroll Motion ---
    const parentGroup = new THREE.Group();
    scene.add(parentGroup);

    // --- Floating Object Factory (Procedural Low-Poly Glyphs) ---
    const floatingObjects = [];

    // Helper: Create 3D Book
    const createBookMesh = (colorVal) => {
      const book = new THREE.Group();
      
      // Cover (Box)
      const coverGeo = new THREE.BoxGeometry(0.8, 0.08, 1.1);
      const coverMat = new THREE.MeshStandardMaterial({ color: colorVal, roughness: 0.5 });
      const cover = new THREE.Mesh(coverGeo, coverMat);
      book.add(cover);

      // Pages (Box)
      const pagesGeo = new THREE.BoxGeometry(0.74, 0.06, 1.04);
      const pagesMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const pages = new THREE.Mesh(pagesGeo, pagesMat);
      pages.position.y = 0.01;
      book.add(pages);

      return book;
    };

    // Helper: Create 3D Graduation Cap
    const createCapMesh = (colorVal) => {
      const cap = new THREE.Group();

      // Board (Top Flat Diamond)
      const boardGeo = new THREE.BoxGeometry(1.1, 0.04, 1.1);
      const boardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.rotation.y = Math.PI / 4;
      cap.add(board);

      // Crown (Bottom Cylinder)
      const crownGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 16);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = -0.14;
      cap.add(crown);

      // Tassel Ribbon
      const tasselGeo = new THREE.BoxGeometry(0.02, 0.02, 0.45);
      const tasselMat = new THREE.MeshBasicMaterial({ color: colorVal });
      const tassel = new THREE.Mesh(tasselGeo, tasselMat);
      tassel.position.set(0.2, -0.05, 0.2);
      tassel.rotation.y = Math.PI / 6;
      cap.add(tassel);

      return cap;
    };

    // Build Floating Pool
    const objectTypes = ['book', 'cap', 'torus', 'math'];
    const colors = [0x2563eb, 0x00f7ff, 0xb980f0, 0x10b981];
    const poolSize = isDark ? 14 : 7; // Reduce density in light mode or mobile

    for (let i = 0; i < poolSize; i++) {
      const type = objectTypes[i % objectTypes.length];
      const color = colors[i % colors.length];
      let mesh;

      if (type === 'book') {
        mesh = createBookMesh(color);
      } else if (type === 'cap') {
        mesh = createCapMesh(color);
      } else if (type === 'torus') {
        // Torus Ring (Representing atom orbitals / science)
        const geo = new THREE.TorusGeometry(0.5, 0.04, 8, 24);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });
        mesh = new THREE.Mesh(geo, mat);
      } else {
        // Tetrahedron (Representing structure / math)
        const geo = new THREE.TetrahedronGeometry(0.4);
        const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 });
        mesh = new THREE.Mesh(geo, mat);
      }

      // Random Scatter Layout Coordinates
      mesh.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8 - 4
      );

      // Random Rotation velocities
      mesh.userData = {
        rotX: (Math.random() - 0.5) * 0.012,
        rotY: (Math.random() - 0.5) * 0.012,
        rotZ: (Math.random() - 0.5) * 0.008,
        floatSpeed: Math.random() * 0.002 + 0.001,
        floatRange: Math.random() * 0.4 + 0.2,
        baseY: mesh.position.y
      };

      parentGroup.add(mesh);
      floatingObjects.push(mesh);
    }

    // --- Interactive 3D Wireframe Globe ---
    // Perfect positioning on the right of the Hero panel
    const globeGroup = new THREE.Group();
    globeGroup.position.set(4.5, 1.5, -4);

    const globeGeo = new THREE.SphereGeometry(2.4, 30, 30);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.18
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    // Inner glowing core
    const coreGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f7ff,
      transparent: true,
      opacity: isDark ? 0.15 : 0.06
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(core);

    parentGroup.add(globeGroup);

    // --- Neural Network Particle Constellation ---
    const nodeCount = isDark ? 30 : 15;
    const nodes = [];
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities = [];

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 10 - 2;

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      nodes.push({ x, y, z });
      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.003
      });
    }

    // Nodes Visual mesh
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: 0x00f7ff,
      size: 0.15,
      transparent: true,
      opacity: isDark ? 0.8 : 0.4
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    parentGroup.add(nodePoints);

    // Connective Lines segments
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: isDark ? 0.2 : 0.08
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    parentGroup.add(lineSegments);

    // --- User Interaction & Mouse Parallax ---
    let mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollPercent = 0;

    window.addEventListener('mousemove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth) - 0.5;
      mouse.ty = (e.clientY / window.innerHeight) - 0.5;
    });

    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        scrollPercent = window.scrollY / scrollHeight;
      }
    });

    // --- Dynamic Theme Adaptability Handler ---
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
      scene.background.setHex(isDark ? 0x0f172a : 0xf8fafc);
      scene.fog.color.setHex(isDark ? 0x0f172a : 0xf8fafc);
      ambientLight.intensity = isDark ? 0.35 : 0.75;
      mainLight.intensity = isDark ? 0.6 : 0.8;
      cyanLight.intensity = isDark ? 1.5 : 0.5;
      purpleLight.intensity = isDark ? 1.5 : 0.5;
      globeMat.opacity = isDark ? 0.35 : 0.18;
      coreMat.opacity = isDark ? 0.15 : 0.06;
      nodeMat.opacity = isDark ? 0.8 : 0.4;
      lineMat.opacity = isDark ? 0.2 : 0.08;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // --- Handle Resize Dynamic Adjustments ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Clock Loop ---
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.008;

      // 1. Hover parallax camera interpolation
      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;
      camera.position.x = mouse.x * 3.5;
      camera.position.y = -mouse.y * 3.5;
      camera.lookAt(0, 0, 0);

      // 2. Scroll-based parallax shifting
      parentGroup.position.y = scrollPercent * 7.5;
      parentGroup.rotation.y = scrollPercent * 0.4;

      // 3. Floating glyphs slow spin and wave bounce
      floatingObjects.forEach(obj => {
        obj.rotation.x += obj.userData.rotX;
        obj.rotation.y += obj.userData.rotY;
        obj.rotation.z += obj.userData.rotZ;

        // Wave float displacement
        obj.position.y = obj.userData.baseY + Math.sin(time * obj.userData.floatSpeed * 300) * obj.userData.floatRange;
      });

      // 4. Globe rotation spin
      globe.rotation.y += 0.003;
      globe.rotation.x += 0.001;

      // 5. Neural network node drift and lines drawing
      const positions = nodeGeo.attributes.position.array;
      const linePositions = [];

      for (let i = 0; i < nodeCount; i++) {
        // Drift positions
        nodes[i].x += nodeVelocities[i].x;
        nodes[i].y += nodeVelocities[i].y;
        nodes[i].z += nodeVelocities[i].z;

        // Bounce back inside boundaries
        if (Math.abs(nodes[i].x) > 10) nodeVelocities[i].x *= -1;
        if (Math.abs(nodes[i].y) > 7) nodeVelocities[i].y *= -1;
        if (Math.abs(nodes[i].z) > 5) nodeVelocities[i].z *= -1;

        positions[i * 3] = nodes[i].x;
        positions[i * 3 + 1] = nodes[i].y;
        positions[i * 3 + 2] = nodes[i].z;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Re-map line segments matching node distances
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 4.2) {
            linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
            linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
          }
        }
      }

      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeo.computeBoundingSphere();

      renderer.render(scene, camera);
    };

    animate();
  }
})();
