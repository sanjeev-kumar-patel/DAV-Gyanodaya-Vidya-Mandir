document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNavbar();
  initStatsCounter();
  initChatbot();
  initActiveNavLinks();
  init3DCampusVisualizer();
  init3DTiltEffects();
  initHero3DParticles();
});

/* ─── 1. Theme Manager (Dark / Light) ─── */
function initTheme() {
  const html = document.documentElement;
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  
  // Get active theme preference
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  applyTheme(savedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      html.classList.add('dark');
      themeToggleBtns.forEach(btn => {
        // Render Moon/Sun icon inside button or change label
        btn.setAttribute('aria-label', 'Switch to Light Mode');
        btn.innerHTML = `
          <svg class="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path>
          </svg>
        `;
      });
    } else {
      html.classList.remove('dark');
      themeToggleBtns.forEach(btn => {
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
        btn.innerHTML = `
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        `;
      });
    }
    localStorage.setItem('theme', theme);
  }
}

/* ─── 2. Mobile Navbar Toggle ─── */
function initMobileNavbar() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
      
      // Update hamburger icon to close mark
      if (!isExpanded) {
        menuBtn.innerHTML = `
          <svg class="w-6 h-6 text-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        `;
      } else {
        menuBtn.innerHTML = `
          <svg class="w-6 h-6 text-foreground" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        `;
      }
    });
  }
}

/* ─── 3. Stats Counter Animation ─── */
function initStatsCounter() {
  const counters = document.querySelectorAll('.stats-counter-value');
  
  if (counters.length === 0) return;

  const animateCounter = (el) => {
    const target = +el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 seconds
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      
      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    };
    
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target); // Animate only once
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(counter => observer.observe(counter));
}

/* ─── 4. AI Chatbot Widget Portal ─── */
function initChatbot() {
  const chatbotTrigger = document.getElementById('chatbot-trigger');
  const chatbotContainer = document.getElementById('chatbot-container');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotMessages = document.getElementById('chatbot-messages');

  if (!chatbotTrigger || !chatbotContainer) return;

  // Toggle Panel open/close
  chatbotTrigger.addEventListener('click', () => {
    chatbotContainer.classList.toggle('hidden');
    chatbotContainer.classList.toggle('flex');
    if (!chatbotContainer.classList.contains('hidden')) {
      chatbotInput.focus();
      // Scroll to bottom
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
  });

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotContainer.classList.add('hidden');
      chatbotContainer.classList.remove('flex');
    });
  }

  // Handle Query Submission
  if (chatbotForm) {
    chatbotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = chatbotInput.value.trim();
      if (!message) return;

      // Add user bubble
      appendMessage('user', message);
      chatbotInput.value = '';

      // Add loading thinking bubble
      const loadingId = appendMessage('bot', 'Thinking...', true);

      try {
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove typing and add actual reply
        removeMessage(loadingId);
        appendMessage('bot', data.reply);
      } catch (err) {
        removeMessage(loadingId);
        appendMessage('bot', 'Sorry, I am having trouble connecting right now. Please try again or check our Contact page.');
      }
    });
  }

  // Helpers to draw message bubbles
  function appendMessage(sender, text, isLoading = false) {
    const bubbleId = 'bubble-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.id = bubbleId;
    bubbleWrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-3 items-end gap-2`;

    const innerDiv = document.createElement('div');
    innerDiv.className = `max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
      sender === 'user' 
        ? 'bg-primary text-white rounded-br-none' 
        : 'bg-background-secondary text-foreground border border-border rounded-bl-none'
    }`;
    
    if (isLoading) {
      innerDiv.innerHTML = `
        <div class="flex items-center gap-1 py-1">
          <span class="w-1.5 h-1.5 bg-foreground-muted rounded-full animate-bounce" style="animation-delay:0.1s"></span>
          <span class="w-1.5 h-1.5 bg-foreground-muted rounded-full animate-bounce" style="animation-delay:0.2s"></span>
          <span class="w-1.5 h-1.5 bg-foreground-muted rounded-full animate-bounce" style="animation-delay:0.3s"></span>
        </div>
      `;
    } else {
      // Format text with linebreaks to <br>
      innerDiv.innerHTML = text.replace(/\n/g, '<br>');
    }

    bubbleWrapper.appendChild(innerDiv);
    chatbotMessages.appendChild(bubbleWrapper);
    
    // Auto Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    return bubbleId;
  }

  function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}

/* ─── 5. Active Navigation Link Highlighter ─── */
function initActiveNavLinks() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      if (link.closest('#desktop-nav')) {
        // Desktop nav highlighting
        if (!link.classList.contains('btn-primary')) {
          link.classList.add('text-primary', 'font-black', 'border-b-2', 'border-primary', 'pb-1');
        }
      } else if (link.closest('#mobile-nav')) {
        // Mobile menu drawer highlighting
        if (!link.classList.contains('btn-primary')) {
          link.classList.add('text-primary', 'font-extrabold', 'bg-primary/10', 'rounded-xl', 'px-3');
        }
      }
    }
  });
}

/* ─── 6. 3D Campus Visualizer Module (Three.js) ─── */
function init3DCampusVisualizer() {
  const canvas = document.getElementById('canvas-3d-campus');
  if (!canvas) return;

  const titleEl = document.getElementById('campus-node-title');
  const descEl = document.getElementById('campus-node-desc');
  const tooltip = document.getElementById('interaction-tooltip');
  const tooltipTitle = document.getElementById('tooltip-title');
  const tooltipDesc = document.getElementById('tooltip-desc');
  const btnRotate = document.getElementById('btn-3d-rotate');
  const btnReset = document.getElementById('btn-3d-reset');

  // Edge Case Handling: WebGL / Three.js fallback
  if (typeof THREE === 'undefined') {
    renderFallbackGraphic();
    return;
  }

  // --- Hotspots Information ---
  const hotspots = [
    {
      name: "Academics Main Block",
      desc: "The core intellectual hub of DAV GVM, containing state-of-the-art smart classrooms, advanced computer centers, and co-educational study spaces.",
      pos: { x: 0, y: 1.2, z: 0 },
      color: 0x2563eb,
      radius: 0.45
    },
    {
      name: "Advanced Science Labs",
      desc: "High-standard Physics, Chemistry, and Biology laboratories equipped with modern tools for practical and experimental training.",
      pos: { x: -3.5, y: 1.0, z: 2.0 },
      color: 0x00f7ff,
      radius: 0.35
    },
    {
      name: "Rich Library & IT Resource",
      desc: "A quiet study sanctuary offering thousands of research books, reference papers, and a computerized information center.",
      pos: { x: 3.5, y: 1.0, z: -2.0 },
      color: 0xb980f0,
      radius: 0.35
    },
    {
      name: "Sports Court & Yoga Arena",
      desc: "Large playfield designed for cricket, volleyball, and physical fitness assemblies combined with mental training.",
      pos: { x: -4.0, y: 0.4, z: -3.0 },
      color: 0x10b981,
      radius: 0.35
    }
  ];

  // --- Setup Three.js Parameters ---
  const scene = new THREE.Scene();
  
  // Theme-aware initial setup
  let isDark = document.documentElement.classList.contains('dark');
  scene.background = new THREE.Color(isDark ? 0x0f172a : 0xf8fafc);
  scene.fog = new THREE.FogExp2(isDark ? 0x0f172a : 0xf8fafc, 0.05);

  // Setup Camera
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  
  // Camera angles (spherical coordinates)
  let theta = 0.8;
  let phi = 1.1;
  let targetRadius = 16;
  let currentRadius = 30; // Start zoomed out for dramatic effect

  // Initialize WebGL Renderer
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.3 : 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 0.6 : 0.8);
  dirLight.position.set(10, 15, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const accentLight = new THREE.PointLight(0x00f7ff, 2, 8);
  accentLight.position.set(0, 5, 0);
  scene.add(accentLight);

  // --- Courtyard & Grid Helper ---
  const gridHelper = new THREE.GridHelper(20, 20, 0x2563eb, isDark ? 0x334155 : 0xcbd5e1);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  const groundGeo = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: isDark ? 0x1e293b : 0xe2e8f0,
    roughness: 0.9,
    metalness: 0.1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // --- Procedural 3D Buildings ---
  // 1. Academics Main Block (Center)
  const mainGeo = new THREE.BoxGeometry(3, 1.8, 3);
  const mainMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, metalness: 0.3 });
  const mainBuilding = new THREE.Mesh(mainGeo, mainMat);
  mainBuilding.position.set(0, 0.9, 0);
  mainBuilding.castShadow = true;
  mainBuilding.receiveShadow = true;
  scene.add(mainBuilding);

  const mainRoofGeo = new THREE.BoxGeometry(3.2, 0.2, 3.2);
  const mainRoofMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
  const mainRoof = new THREE.Mesh(mainRoofGeo, mainRoofMat);
  mainRoof.position.set(0, 1.9, 0);
  scene.add(mainRoof);

  // 2. Science Labs (Left Blue-Cyan Block)
  const scienceGeo = new THREE.BoxGeometry(2, 1.4, 2);
  const scienceMat = new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.5 });
  const scienceBuilding = new THREE.Mesh(scienceGeo, scienceMat);
  scienceBuilding.position.set(-3.5, 0.7, 2.0);
  scienceBuilding.castShadow = true;
  scene.add(scienceBuilding);

  // 3. Library & IT (Right Purple Block)
  const libraryGeo = new THREE.BoxGeometry(2, 1.5, 2.2);
  const libraryMat = new THREE.MeshStandardMaterial({ color: 0x6b21a8, roughness: 0.4 });
  const libraryBuilding = new THREE.Mesh(libraryGeo, libraryMat);
  libraryBuilding.position.set(3.5, 0.75, -2.0);
  libraryBuilding.castShadow = true;
  scene.add(libraryBuilding);

  // 4. Playground and Green Pitch
  const pitchGeo = new THREE.BoxGeometry(4, 0.05, 3.5);
  const pitchMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.9 });
  const pitch = new THREE.Mesh(pitchGeo, pitchMat);
  pitch.position.set(-4.0, 0.025, -3.0);
  scene.add(pitch);

  // --- Environment Decorations (Trees) ---
  const addTree = (x, z) => {
    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 0.3, z);
    
    const foliageGeo = new THREE.ConeGeometry(0.4, 0.8, 8);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.set(0, 0.6, 0);
    trunk.add(foliage);
    
    scene.add(trunk);
  };

  addTree(2, 2.5);
  addTree(1.5, 3.5);
  addTree(-2, -1.5);
  addTree(-1, -2.5);
  addTree(4, 3);
  addTree(-3.5, 0);

  // --- Create Hotspot Beacons ---
  const beaconMeshes = [];
  hotspots.forEach((node, index) => {
    // Glowing Core Sphere
    const sphereGeo = new THREE.SphereGeometry(node.radius, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ 
      color: node.color,
      transparent: true,
      opacity: 0.8
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(node.pos.x, node.pos.y, node.pos.z);
    sphere.userData = { ...node, index };
    scene.add(sphere);
    beaconMeshes.push(sphere);

    // Glowing Pulse Halo Ring
    const haloGeo = new THREE.RingGeometry(node.radius + 0.05, node.radius + 0.25, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: node.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(node.pos.x, node.pos.y, node.pos.z);
    scene.add(halo);
    sphere.userData.halo = halo;
  });

  // --- Custom Orbital Interaction Controls ---
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let autoRotate = true;
  let currentSelectionIndex = 0;

  // Render Loop Camera Calculation
  const updateCamera = () => {
    // Zoom interpolator
    currentRadius += (targetRadius - currentRadius) * 0.05;

    // Boundary constraints for Vertical Camera Rotation (Phi)
    phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi));

    camera.position.x = currentRadius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = currentRadius * Math.cos(phi);
    camera.position.z = currentRadius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0.4, 0);
  };

  // Dragging Mouse Interactions
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    autoRotate = false;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      theta -= deltaX * 0.005;
      phi -= deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
    
    // Raycasting for Beacon hovers
    performRaycast(e);
  });

  // Zoom Mouse wheel Interaction
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetRadius += e.deltaY * 0.01;
    targetRadius = Math.max(8, Math.min(30, targetRadius));
    autoRotate = false;
  }, { passive: false });

  // Toggle Auto Rotation Button
  if (btnRotate) {
    btnRotate.addEventListener('click', () => {
      autoRotate = !autoRotate;
      btnRotate.classList.toggle('bg-primary/20');
    });
  }

  // Reset View Camera Positions
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      theta = 0.8;
      phi = 1.1;
      targetRadius = 16;
      currentRadius = 26;
      autoRotate = true;
      selectHotspot(0);
    });
  }

  // --- Click & Touch Interactivity (Raycasting) ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function selectHotspot(index) {
    const node = hotspots[index];
    currentSelectionIndex = index;
    
    // Animate details card HTML using smooth transitions
    if (titleEl && descEl) {
      const parent = document.getElementById('campus-3d-details');
      parent.style.opacity = 0;
      parent.style.transform = 'translateY(10px)';
      parent.style.transition = 'all 0.3s ease';

      setTimeout(() => {
        titleEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: #${node.color.toString(16)}"></span> ${node.name}`;
        descEl.textContent = node.desc;
        parent.style.opacity = 1;
        parent.style.transform = 'translateY(0)';
      }, 300);
    }
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(beaconMeshes);

    if (intersects.length > 0) {
      const selectedBeacon = intersects[0].object;
      const index = selectedBeacon.userData.index;
      selectHotspot(index);
      
      // Camera moves to focus on node
      theta = Math.atan2(selectedBeacon.position.x, selectedBeacon.position.z) + 0.3;
      targetRadius = 12;
      autoRotate = false;
    }
  });

  function performRaycast(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(beaconMeshes);

    let foundIntersection = false;
    canvas.style.cursor = 'grab';
    if (isDragging) canvas.style.cursor = 'grabbing';

    beaconMeshes.forEach(mesh => {
      mesh.scale.set(1, 1, 1);
    });

    if (intersects.length > 0) {
      canvas.style.cursor = 'pointer';
      const intersectedObject = intersects[0].object;
      intersectedObject.scale.set(1.3, 1.3, 1.3);

      const nodeData = intersectedObject.userData;
      foundIntersection = true;

      // Show HTML Tooltip above mouse position
      if (tooltip) {
        tooltipTitle.textContent = nodeData.name;
        tooltipDesc.textContent = "Click to view campus details";
        tooltip.style.left = `${e.clientX - rect.left + 15}px`;
        tooltip.style.top = `${e.clientY - rect.top + 15}px`;
        tooltip.style.display = 'block';
      }
    } else {
      if (tooltip) tooltip.style.display = 'none';
    }
  }

  // --- Dynamic Theme Adaptability Handler ---
  const themeObserver = new MutationObserver(() => {
    isDark = document.documentElement.classList.contains('dark');
    scene.background.setHex(isDark ? 0x0f172a : 0xf8fafc);
    scene.fog.color.setHex(isDark ? 0x0f172a : 0xf8fafc);
    ambientLight.intensity = isDark ? 0.3 : 0.6;
    dirLight.intensity = isDark ? 0.6 : 0.8;
    groundMat.color.setHex(isDark ? 0x1e293b : 0xe2e8f0);
    
    // Recreate grid helper dynamically
    scene.remove(gridHelper);
    const newGrid = new THREE.GridHelper(20, 20, 0x2563eb, isDark ? 0x334155 : 0xcbd5e1);
    newGrid.position.y = 0.01;
    scene.add(newGrid);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // --- Handle Resize Dynamic Adjustments ---
  const resizeHandler = () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  };
  window.addEventListener('resize', resizeHandler);

  // --- Animation loop ---
  let pulseTimer = 0;
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    pulseTimer += delta * 4;

    // Beacons floating and pulsing animations
    beaconMeshes.forEach(mesh => {
      const idx = mesh.userData.index;
      // Bounce vertical positions slightly
      mesh.position.y = hotspots[idx].pos.y + Math.sin(pulseTimer + idx) * 0.08;
      
      // Pulse scale of outer ring halo
      if (mesh.userData.halo) {
        const ring = mesh.userData.halo;
        const scaleVal = 1.0 + Math.abs(Math.sin(pulseTimer * 1.5 + idx)) * 0.5;
        ring.scale.set(scaleVal, scaleVal, 1);
        ring.material.opacity = 0.35 - (scaleVal - 1.0) * 0.4;
        ring.position.y = mesh.position.y;
      }
    });

    // Auto rotate camera
    if (autoRotate) {
      theta += 0.12 * delta;
    }

    updateCamera();
    renderer.render(scene, camera);
  };

  // Run Visualizer loop
  animate();
  selectHotspot(0);

  // --- Fallback graphic logic ---
  function renderFallbackGraphic() {
    console.warn("Fallback Render initiated for 3D Campus Tour Canvas.");
    const ctx = canvas.getContext('2d');
    
    const drawPlaceholder = () => {
      const w = canvas.width = canvas.clientWidth;
      const h = canvas.height = canvas.clientHeight;
      const isDarkTheme = document.documentElement.classList.contains('dark');
      
      ctx.fillStyle = isDarkTheme ? '#1e293b' : '#eff6ff';
      ctx.fillRect(0, 0, w, h);

      // Simple elegant schematic blueprint drawing
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, w - 80, h - 80);
      
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillStyle = isDarkTheme ? '#f8fafc' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText('3D Interactive Campus Map (Schematic View)', w / 2, h / 2 - 20);
      
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Interactive WebGL rendering requires hardware support. Your experience remains active!', w / 2, h / 2 + 10);
    };

    drawPlaceholder();
    window.addEventListener('resize', drawPlaceholder);
    
    // Auto-update details card list directly
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % 4;
      const parent = document.getElementById('campus-3d-details');
      if (parent) {
        parent.style.opacity = 0;
        setTimeout(() => {
          const names = ["Academics Main Block", "Advanced Science Labs", "Rich Library & IT Resource", "Sports Court & Yoga Arena"];
          const descs = [
            "The core intellectual hub of DAV GVM, containing smart classrooms and digital computer centers.",
            "Advanced Physics, Chemistry, and Biology laboratories built for safe experiments.",
            "Study sanctuary holding over 5,000+ reference volumes and journals.",
            "High-standard playground and athletic courses promoting fitness and morning meditation."
          ];
          const colors = ["2563eb", "00f7ff", "b980f0", "10b981"];
          
          if (titleEl && descEl) {
            titleEl.innerHTML = `<span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: #${colors[idx]}"></span> ${names[idx]}`;
            descEl.textContent = descs[idx];
          }
          parent.style.opacity = 1;
        }, 300);
      }
    }, 6000);
  }
}

/* ─── 7. Interactive 3D Card Tilt & Reflection Sheen Effect ─── */
function init3DTiltEffects() {
  const cards = document.querySelectorAll('.theme-card');
  if (cards.length === 0) return;

  cards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.perspective = '1000px';
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    
    // Add specular glare sheeting dynamically
    const sheen = document.createElement('div');
    sheen.className = 'sheen-reflection';
    sheen.style.position = 'absolute';
    sheen.style.inset = '0';
    sheen.style.borderRadius = 'inherit';
    sheen.style.pointerEvents = 'none';
    sheen.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 80%)';
    sheen.style.mixBlendMode = 'overlay';
    sheen.style.opacity = '0';
    sheen.style.transition = 'opacity 0.5s ease';
    card.appendChild(sheen);

    card.addEventListener('mouseenter', () => {
      sheen.style.opacity = '1';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const width = rect.width;
      const height = rect.height;
      
      // Subtle 3D tilt coordinates
      const rotateY = ((x / width) - 0.5) * 12;
      const rotateX = -((y / height) - 0.5) * 12;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Dynamic shift of specular gloss coordinates
      const sheenX = (x / width) * 100;
      const sheenY = (y / height) * 100;
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
    });

    card.addEventListener('mouseleave', () => {
      sheen.style.opacity = '0';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ─── 8. 3D-Like Floating Particle Emitter Background (Hero Canvas) ─── */
function initHero3DParticles() {
  const canvas = document.getElementById('canvas-hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Particle specifications
  const particles = [];
  const particleCount = 80;
  
  let mouse = { x: null, y: null, radius: 130 };
  
  const resizeCanvas = () => {
    if (!canvas.parentElement) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle Class Structure
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initially = false) {
      this.x = Math.random() * canvas.width;
      this.y = initially ? Math.random() * canvas.height : canvas.height + 10;
      this.size = Math.random() * 1.8 + 0.8; 
      this.speedY = -(Math.random() * 0.35 + 0.08); 
      this.speedX = (Math.random() - 0.5) * 0.15; 
      this.alpha = Math.random() * 0.35 + 0.15;
      this.baseAlpha = this.alpha;
      
      const colors = ['rgba(0, 247, 255, ', 'rgba(185, 128, 240, ', 'rgba(37, 99, 235, '];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset(false);
      }

      // Magnetic depth repel force on hover
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = dx / distance;
          const directionY = dy / distance;
          
          this.x -= directionX * force * 1.2;
          this.y -= directionY * force * 1.2;
          this.alpha = Math.min(0.9, this.baseAlpha + force * 0.3);
        } else {
          this.alpha = this.baseAlpha;
        }
      } else {
        this.alpha = this.baseAlpha;
      }
    }

    draw() {
      const isDarkTheme = document.documentElement.classList.contains('dark');
      let finalColor;
      if (isDarkTheme) {
        finalColor = `${this.colorBase}${this.alpha})`;
      } else {
        finalColor = `rgba(37, 99, 235, ${this.alpha * 0.55})`;
      }

      ctx.fillStyle = finalColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Build Particle Pool
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Main Loop
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  // Auto clean listeners on layout shift
  const observer = new MutationObserver(() => {
    if (!document.body.contains(canvas)) {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/* ─── 9. High-Performance Global Ambient Aurora Mesh Background ─── */
function initGlobalAuroraBackground() {
  const canvas = document.getElementById('global-aurora-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Offscreen low-resolution canvas size (bilinear filtering handles upscaling perfectly at 60 FPS)
  const renderWidth = 320;
  const renderHeight = 320;
  canvas.width = renderWidth;
  canvas.height = renderHeight;

  // Track Mouse & Scroll
  let mouse = { x: renderWidth / 2, y: renderHeight / 2, tx: renderWidth / 2, ty: renderHeight / 2 };
  let scrollOffset = 0;
  let targetScrollOffset = 0;

  window.addEventListener('mousemove', (e) => {
    // Normalize coordinates to offscreen bounds
    mouse.tx = (e.clientX / window.innerWidth) * renderWidth;
    mouse.ty = (e.clientY / window.innerHeight) * renderHeight;
  });

  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll > 0) {
      targetScrollOffset = (window.scrollY / maxScroll) * 80; // max shift 80 units
    }
  });

  // Base configurations for fluid blobs
  const blobs = [
    { x: 50, y: 50, tx: 50, ty: 50, vx: 0.1, vy: 0.1, radius: 140, colorDark: 'rgba(37, 99, 235, 0.16)', colorLight: 'rgba(186, 230, 253, 0.28)' },
    { x: 250, y: 80, tx: 250, ty: 80, vx: -0.08, vy: 0.12, radius: 130, colorDark: 'rgba(0, 247, 255, 0.12)', colorLight: 'rgba(204, 251, 241, 0.22)' },
    { x: 100, y: 240, tx: 100, ty: 240, vx: 0.12, vy: -0.08, radius: 150, colorDark: 'rgba(139, 92, 246, 0.14)', colorLight: 'rgba(243, 232, 255, 0.24)' },
    { x: 260, y: 260, tx: 260, ty: 260, vx: -0.1, vy: -0.1, radius: 120, colorDark: 'rgba(236, 72, 153, 0.08)', colorLight: 'rgba(255, 255, 255, 0.2)' }
  ];

  let time = 0;

  // Main Render Loop
  const renderAurora = () => {
    // Clear canvas
    ctx.clearRect(0, 0, renderWidth, renderHeight);

    time += 0.003;
    const isDarkTheme = document.documentElement.classList.contains('dark');

    // Smoothly interpolate mouse and scroll coordinates
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    scrollOffset += (targetScrollOffset - scrollOffset) * 0.05;

    // Draw ambient mesh color blobs
    blobs.forEach((blob, index) => {
      // Natural fluid mathematical movement using trigonometry
      const driftX = Math.sin(time + index * 1.5) * 45;
      const driftY = Math.cos(time * 0.8 + index * 2) * 45;

      // Update positions with drift
      blob.x = blob.tx + driftX;
      blob.y = blob.ty + driftY - scrollOffset * (index === 0 || index === 2 ? 0.35 : -0.2);

      // Magnetic Attraction: gently pull blob center towards cursor if nearby
      const dx = mouse.x - blob.x;
      const dy = mouse.y - blob.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const pull = (150 - dist) / 150 * 20;
        blob.x += (dx / dist) * pull;
        blob.y += (dy / dist) * pull;
      }

      // Render radial gradient glow blob
      const gradient = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, blob.radius
      );
      
      const blobColor = isDarkTheme ? blob.colorDark : blob.colorLight;
      gradient.addColorStop(0, blobColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    animationFrameId = requestAnimationFrame(renderAurora);
  };

  renderAurora();
}


