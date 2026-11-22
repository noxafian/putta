/**
 * apartment3d.js — The Bilwa by SIPL 3D Architectural Experience
 * ─────────────────────────────────────────────────────────────────
 * High-performance procedural Three.js visualization of the Putta
 * family's new residence at The Bilwa by SIPL, Miyapur, Hyderabad.
 *
 * Implements ENG-3D-MAPS-BILWA-V3:
 *  • Standalone Three.js architecture mounted inside .house-photo-frame
 *  • Procedural massing based on verified home.png architectural reference
 *  • Constrained orbit (±45° azimuth) to preserve visual fidelity boundary
 *  • Cinematic Catmull-Rom entrance gate fly-through passing under the canopy arch
 *  • Smooth handoff to Section 3 (Family Welcome)
 *  • Adaptive device tiers (Tiers 1-3) & robust static photo fallback
 * ─────────────────────────────────────────────────────────────────
 */

(function (window, document) {
  'use strict';

  var Apartment3D = {
    initialized: false,
    active: false,
    container: null,
    canvas: null,
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    buildingGroup: null,
    animFrameId: null,
    isFlying: false,
    flyProgress: 0,
    flyDuration: 4200, // ms
    flyStartTime: 0,
    flySpline: null,
    qualityTier: 1,
    uiOverlay: null,
    photoImg: null,

    // Mathematical spline anchors for entrance gate fly-in
    splinePoints: [
      { x: 22.0, y: 14.0, z: 38.0 },  // P0: Exterior hero viewpoint
      { x: 12.0, y: 7.0, z: 24.0 },  // P1: Driveway approach descent
      { x: 4.0, y: 3.5, z: 12.0 },  // P2: Alignment before entrance arch
      { x: 0.0, y: 2.8, z: 3.2 },   // P3: Passing directly underneath canopy
      { x: 0.0, y: 2.8, z: -4.0 }   // P4: Arrival court threshold
    ],

    lookAtSplinePoints: [
      { x: 0.0, y: 16.0, z: 0.0 },   // Looking at upper façade
      { x: 2.0, y: 8.0, z: 4.0 },   // Tilting down toward gate
      { x: 1.0, y: 3.2, z: 2.0 },   // Leveling at entrance arch
      { x: 0.0, y: 2.8, z: -1.0 },  // Looking forward through arch
      { x: 0.0, y: 2.8, z: -12.0 }  // Looking into arrival court
    ]
  };

  /**
   * Device Profiling & Quality Tier Determination
   */
  function determineQualityTier() {
    var cores = navigator.hardwareConcurrency || 4;
    var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    var isSmallScreen = window.innerWidth < 768;

    if (isMobile && cores <= 4) {
      return 3; // Budget mobile / battery saver
    }
    if (isMobile || isSmallScreen) {
      return 2; // Mid-tier mobile / tablet
    }
    return 1; // High-end desktop
  }

  /**
   * Initialize the 3D Experience inside .house-photo-frame
   */
  function init() {
    if (Apartment3D.initialized) return;

    // Check if 3D experience is enabled via KnockConfig (disabled by default)
    if (window.KnockConfig) {
      var cfg = window.KnockConfig.get();
      if (!cfg || cfg.apartment3dActive !== true) {
        console.log('Apartment3D: Disabled.');
        return;
      }
    } else {
      return;
    }

    var frame = document.querySelector('.house-photo-frame');
    if (!frame) return;

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Falling back to static house photograph.');
      return;
    }

    Apartment3D.container = frame;
    Apartment3D.photoImg = frame.querySelector('#house-photo') || frame.querySelector('img');
    Apartment3D.qualityTier = determineQualityTier();

    try {
      setupScene();
      buildProceduralBilwa();
      setupSplines();
      setupUI();
      setupEvents();

      Apartment3D.initialized = true;

      // ── DEFAULT STATE: show static photo, hide 3D canvas ──
      // The guest sees the original home.jpg first.
      // 3D activates only when they click "View in 3D".
      Apartment3D.active = false;
      if (Apartment3D.canvas) {
        Apartment3D.canvas.style.display = 'none';
        Apartment3D.canvas.style.opacity = '0';
      }
      if (Apartment3D.photoImg) {
        Apartment3D.photoImg.style.display = 'block';
      }
      // Hide the 3D control overlay until activated
      if (Apartment3D.uiOverlay) {
        Apartment3D.uiOverlay.style.display = 'none';
      }

      // Inject "View in 3D" activate button over the photo
      injectActivateButton();

      // Start render loop silently in background (ready when guest activates)
      animate();

      console.log('Apartment3D: Initialized (photo default, 3D on-demand, Tier ' + Apartment3D.qualityTier + ')');
    } catch (err) {
      console.error('Apartment3D initialization error:', err);
      // Graceful fallback to static photo
      if (Apartment3D.canvas && Apartment3D.canvas.parentNode) {
        Apartment3D.canvas.parentNode.removeChild(Apartment3D.canvas);
      }
    }
  }

  /**
   * Inject the "🌐 View in 3D" pill button over the static photo
   */
  function injectActivateButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'a3d-activate-btn';
    btn.id = 'a3d-activate-btn';
    btn.setAttribute('aria-label', 'View building in interactive 3D');
    btn.innerHTML = '<span class="a3d-activate-btn-icon">🌐</span> View in 3D';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      activateThreeD();
    });
    Apartment3D.container.appendChild(btn);
    Apartment3D.activateBtn = btn;
  }

  /**
   * Activate 3D canvas: expand vertical height, show canvas, hide photo
   */
  function activateThreeD() {
    if (Apartment3D.active) return;
    Apartment3D.active = true;

    // Expand frame height for a tall, immersive 3D architectural exploration
    Apartment3D.container.classList.add('house-photo-frame--3d-expanded');

    // Hide activate button
    if (Apartment3D.activateBtn) Apartment3D.activateBtn.style.display = 'none';

    // Show canvas with smooth fade-in
    if (Apartment3D.canvas) {
      Apartment3D.canvas.style.display = 'block';
      requestAnimationFrame(function () {
        Apartment3D.canvas.style.opacity = '1';
      });
    }

    // Hide photo after canvas fades in to avoid any visual flicker
    setTimeout(function () {
      if (Apartment3D.active && Apartment3D.photoImg) {
        Apartment3D.photoImg.style.display = 'none';
      }
    }, 450);

    // Show 3D UI overlay
    if (Apartment3D.uiOverlay) Apartment3D.uiOverlay.style.display = 'flex';

    // Resize renderer to fit new expanded vertical container size
    setTimeout(function () {
      if (Apartment3D.renderer && Apartment3D.camera) {
        var w = Apartment3D.container.clientWidth || 800;
        var h = Apartment3D.container.clientHeight || (window.innerWidth >= 768 ? 680 : (window.innerWidth >= 480 ? 600 : 520));
        Apartment3D.renderer.setSize(w, h, false);
        Apartment3D.camera.aspect = w / h;
        Apartment3D.camera.updateProjectionMatrix();
      }
    }, 350);
  }

  /**
   * Deactivate 3D — return to static photo, collapse vertical height
   */
  function deactivateThreeD() {
    Apartment3D.active = false;

    // Show photo first so it reveals under the fading canvas
    if (Apartment3D.photoImg) Apartment3D.photoImg.style.display = 'block';

    // Collapse frame height back to original photo height
    Apartment3D.container.classList.remove('house-photo-frame--3d-expanded');

    // Fade out + hide canvas
    if (Apartment3D.canvas) {
      Apartment3D.canvas.style.opacity = '0';
      setTimeout(function () {
        if (!Apartment3D.active && Apartment3D.canvas) {
          Apartment3D.canvas.style.display = 'none';
        }
      }, 400);
    }

    // Hide 3D overlay
    if (Apartment3D.uiOverlay) Apartment3D.uiOverlay.style.display = 'none';

    // Show activate button again
    if (Apartment3D.activateBtn) Apartment3D.activateBtn.style.display = '';
  }


/**
 * WebGL Scene, Camera, Renderer & Lighting Setup
 */
function setupScene() {
  var width = Apartment3D.container.clientWidth || 800;
  // Maintain a balanced aspect ratio matching home.png (approx 1.3:1)
  var height = Math.max(480, Math.round(width * 0.76));

  // Scene with dark teal atmosphere matching home.png
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a3333);
  scene.fog = new THREE.FogExp2(0x1a3333, 0.010);
  Apartment3D.scene = scene;

  // Camera setup
  var camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 300);
  camera.position.set(22.0, 14.0, 38.0);
  Apartment3D.camera = camera;

  // Renderer setup
  var renderer = new THREE.WebGLRenderer({
    antialias: Apartment3D.qualityTier <= 2,
    powerPreference: 'high-performance',
    alpha: false
  });
  renderer.setSize(width, height, false);

  // Apply Tier Pixel Ratio
  var maxDpr = Apartment3D.qualityTier === 1 ? 2.0 : (Apartment3D.qualityTier === 2 ? 1.5 : 1.0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));

  // Tone Mapping & Color Management
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // Shadows
  if (Apartment3D.qualityTier <= 2) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = Apartment3D.qualityTier === 1 ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  } else {
    renderer.shadowMap.enabled = false;
  }

  // Canvas styling & insertion — starts hidden; shown when guest activates 3D
  var canvas = renderer.domElement;
  canvas.className = 'apartment-3d-canvas';
  canvas.style.display = 'none';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.borderRadius = 'inherit';
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

  // Hide static image once canvas is appended
  Apartment3D.container.appendChild(canvas);
  Apartment3D.canvas = canvas;
  Apartment3D.renderer = renderer;
  // Note: canvas starts hidden — activateThreeD() shows it when guest clicks "View in 3D"

  // Orbit Controls Setup (Constrained to front arc ±45°)
  if (typeof THREE.OrbitControls !== 'undefined') {
    var controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0.0, 16.0, 0.0);

    // Clamped Azimuth: front arc only (-45° to +45°) to preserve fidelity boundary
    controls.minAzimuthAngle = -Math.PI / 4;
    controls.maxAzimuthAngle = Math.PI / 4;

    // Clamped Polar: prevent seeing under ground or straight down
    controls.minPolarAngle = Math.PI / 6;       // 30°
    controls.maxPolarAngle = Math.PI * 0.46;    // ~83°

    // Clamped Distance
    controls.minDistance = 22.0;
    controls.maxDistance = 65.0;

    controls.enablePan = false;
    Apartment3D.controls = controls;
  }

  // Lighting Design
  setupLighting(scene);
}

/**
 * Architectural & Atmospheric Lighting Setup
 */
function setupLighting(scene) {
  // 1. Hemisphere Light (Soft Sky Blue + Warm Ground Amber)
  var hemiLight = new THREE.HemisphereLight(0xebf3f9, 0xdcd2be, 0.85);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  // 2. Primary Directional Sunlight (Crisp architectural highlights)
  var sunLight = new THREE.DirectionalLight(0xfff6eb, 1.25);
  sunLight.position.set(30, 45, 35);
  if (Apartment3D.qualityTier <= 2) {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = Apartment3D.qualityTier === 1 ? 2048 : 1024;
    sunLight.shadow.mapSize.height = Apartment3D.qualityTier === 1 ? 2048 : 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 130;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -10;
    sunLight.shadow.bias = -0.0004;
  }
  scene.add(sunLight);

  // 3. Warm Gold Accent Rim Light (Telugu celebratory touch)
  var goldRim = new THREE.DirectionalLight(0xc5a059, 0.45);
  goldRim.position.set(-25, 20, -15);
  scene.add(goldRim);

  // 4. Subtle Entrance Portal Fill Light
  var entranceFill = new THREE.PointLight(0xffeedd, 0.6, 25);
  entranceFill.position.set(3.0, 5.0, 10.0);
  scene.add(entranceFill);
}

/**
 * Procedural Architectural Reconstruction of The Bilwa by SIPL
 */
function buildProceduralBilwa() {
  var root = new THREE.Group();
  root.name = 'BilwaApartmentRoot';

  // Materials Palette
  var ivoryWallMat = new THREE.MeshStandardMaterial({
    color: 0xebe6dc,
    roughness: 0.45,
    metalness: 0.05
  });

  var charcoalFrameMat = new THREE.MeshStandardMaterial({
    color: 0x222629,
    roughness: 0.35,
    metalness: 0.25
  });

  var glassBalustradeMat = new THREE.MeshStandardMaterial({
    color: 0x5c858a,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.55
  });

  var windowGlassMat = new THREE.MeshStandardMaterial({
    color: 0x1f2c33,
    roughness: 0.15,
    metalness: 0.4
  });

  var greenLivingWallMat = new THREE.MeshStandardMaterial({
    color: 0x245838,
    roughness: 0.8,
    metalness: 0.05
  });

  var goldLettersMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.25,
    metalness: 0.85
  });

  var roadAsphaltMat = new THREE.MeshStandardMaterial({
    color: 0x2c3033,
    roughness: 0.85,
    metalness: 0.05
  });

  var kerbWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 });
  var kerbBlackMat = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, roughness: 0.6 });
  var hedgeGreenMat = new THREE.MeshStandardMaterial({ color: 0x2e6638, roughness: 0.85 });

  // ── 1. GROUND & APPROACH ROADWAY ──
  var groundGeo = new THREE.PlaneGeometry(160, 160);
  var groundMesh = new THREE.Mesh(groundGeo, roadAsphaltMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = 0;
  groundMesh.receiveShadow = true;
  root.add(groundMesh);

  // Striped Black & White Perimeter Kerbs
  var kerbGroup = new THREE.Group();
  for (var k = -35; k <= 35; k += 1.8) {
    var mat = Math.abs(Math.round(k / 1.8)) % 2 === 0 ? kerbWhiteMat : kerbBlackMat;
    var kerbBlock = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.25, 0.4), mat);
    kerbBlock.position.set(k, 0.125, 20.0);
    kerbBlock.receiveShadow = true;
    kerbGroup.add(kerbBlock);
  }
  root.add(kerbGroup);

  // Green Hedge Strips along driveway
  var hedgeGeo = new THREE.BoxGeometry(70, 0.75, 1.2);
  var hedge = new THREE.Mesh(hedgeGeo, hedgeGreenMat);
  hedge.position.set(0, 0.375, 20.8);
  hedge.receiveShadow = true;
  root.add(hedge);

  // ── 2. THREE-WING TOWER MASSING ──
  // Dimensions: 13 storeys (~44m total height), ~42m width across 3 articulated blocks
  var floorCount = 13;
  var floorHeight = 3.3; // meters
  var podiumHeight = 4.2;

  var wingConfigs = [
    { id: 'west', x: -14.0, z: -1.0, width: 12.5, depth: 22.0 },
    { id: 'center', x: 0.0, z: 1.2, width: 14.5, depth: 24.0 }, // Protrudes forward slightly
    { id: 'east', x: 14.5, z: -0.5, width: 13.0, depth: 22.5 }
  ];

  // Building Main Body Group
  var towersGroup = new THREE.Group();

  wingConfigs.forEach(function (wing) {
    var totalH = podiumHeight + (floorCount - 1) * floorHeight;
    var coreGeo = new THREE.BoxGeometry(wing.width, totalH, wing.depth);
    var coreMesh = new THREE.Mesh(coreGeo, ivoryWallMat);
    coreMesh.position.set(wing.x, totalH / 2, wing.z);
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    towersGroup.add(coreMesh);

    // Floor Slabs & Balconies
    for (var f = 1; f < floorCount; f++) {
      var slabY = podiumHeight + (f - 1) * floorHeight;

      // Balcony projection on front façade
      var balconyDepth = 2.4;
      var balconyWidth = wing.width * 0.88;
      var balconyGeo = new THREE.BoxGeometry(balconyWidth, 0.32, balconyDepth);
      var balconyMesh = new THREE.Mesh(balconyGeo, ivoryWallMat);
      balconyMesh.position.set(wing.x, slabY, wing.z + wing.depth / 2 + balconyDepth / 2);
      balconyMesh.castShadow = true;
      balconyMesh.receiveShadow = true;
      towersGroup.add(balconyMesh);

      // Glass Balustrade
      var glassGeo = new THREE.BoxGeometry(balconyWidth - 0.2, 1.05, 0.08);
      var glassMesh = new THREE.Mesh(glassGeo, glassBalustradeMat);
      glassMesh.position.set(wing.x, slabY + 0.65, wing.z + wing.depth / 2 + balconyDepth - 0.05);
      towersGroup.add(glassMesh);

      // Glass Handrail (Dark metal strip)
      var railGeo = new THREE.BoxGeometry(balconyWidth, 0.08, 0.12);
      var railMesh = new THREE.Mesh(railGeo, charcoalFrameMat);
      railMesh.position.set(wing.x, slabY + 1.2, wing.z + wing.depth / 2 + balconyDepth - 0.05);
      towersGroup.add(railMesh);

      // Recessed Front Windows
      var winGeo = new THREE.BoxGeometry(balconyWidth * 0.85, 2.3, 0.15);
      var winMesh = new THREE.Mesh(winGeo, windowGlassMat);
      winMesh.position.set(wing.x, slabY + 1.35, wing.z + wing.depth / 2 + 0.05);
      towersGroup.add(winMesh);
    }

    // Parapet Roof Top
    var roofH = 1.4;
    var roofGeo = new THREE.BoxGeometry(wing.width + 0.6, roofH, wing.depth + 0.6);
    var roofMesh = new THREE.Mesh(roofGeo, charcoalFrameMat);
    roofMesh.position.set(wing.x, totalH + roofH / 2, wing.z);
    towersGroup.add(roofMesh);
  });

  root.add(towersGroup);

  // ── 3. SIGNATURE BILWA GEOMETRIC BLACK BALCONY FRAMES ──
  // Bold geometric ribbons wrapping around groups of 2-3 floors on the outer corners
  var frameGroup = new THREE.Group();

  function createGeometricAccent(x, y, z, w, h, d) {
    var frameMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), charcoalFrameMat);
    frameMesh.position.set(x, y, z);
    frameMesh.castShadow = true;
    frameMesh.receiveShadow = true;
    frameGroup.add(frameMesh);
  }

  // West Wing Geometric Accents (Floors 3-5, 7-9, 10-12)
  var westX = -14.0 - 6.25;
  [14.0, 24.0, 34.0].forEach(function (yLevel) {
    // Vertical corner rib
    createGeometricAccent(westX, yLevel, 10.5, 0.6, 7.5, 0.6);
    // Horizontal top return
    createGeometricAccent(westX + 3.0, yLevel + 3.5, 10.5, 6.0, 0.5, 0.6);
    // Horizontal bottom return
    createGeometricAccent(westX + 3.0, yLevel - 3.5, 10.5, 6.0, 0.5, 0.6);
  });

  // East Wing Corner Ribbon (Prominently visible in home.png)
  var eastX = 14.5 + 6.5;
  [12.0, 22.0, 32.0].forEach(function (yLevel) {
    // Corner wrap outer L-frame
    createGeometricAccent(eastX, yLevel, 11.2, 0.7, 8.2, 0.7);
    createGeometricAccent(eastX - 3.5, yLevel + 3.8, 11.2, 7.0, 0.6, 0.7);
    createGeometricAccent(eastX - 3.5, yLevel - 3.8, 11.2, 7.0, 0.6, 0.7);
  });

  root.add(frameGroup);

  // ── 4. SIGNATURE ENTRANCE CANOPY ARCH (THE BILWA PORTAL) ──
  // Distinctive curved white canopy arch spanning the driveway with living wall support
  var portalGroup = new THREE.Group();
  portalGroup.position.set(3.0, 0, 11.5);

  // Left Support Pillar with Living Green Wall
  var greenPillarGeo = new THREE.BoxGeometry(2.4, 6.5, 2.8);
  var greenPillar = new THREE.Mesh(greenPillarGeo, greenLivingWallMat);
  greenPillar.position.set(-4.5, 3.25, 0);
  greenPillar.castShadow = true;
  greenPillar.receiveShadow = true;
  portalGroup.add(greenPillar);

  // Right Marble/Stone Support Column
  var rightColumnGeo = new THREE.BoxGeometry(1.6, 6.5, 2.2);
  var rightColumn = new THREE.Mesh(rightColumnGeo, charcoalFrameMat);
  rightColumn.position.set(4.8, 3.25, 0);
  rightColumn.castShadow = true;
  portalGroup.add(rightColumn);

  // Overhead Curved White Arch Canopy (Width ~10.5m, Height clearance ~6.5m)
  var canopyRoofGeo = new THREE.BoxGeometry(11.8, 0.75, 4.5);
  var canopyRoof = new THREE.Mesh(canopyRoofGeo, ivoryWallMat);
  canopyRoof.position.set(0.1, 6.5, 0);
  canopyRoof.castShadow = true;
  portalGroup.add(canopyRoof);

  // Curved Arch Underside Trim
  var archUndersideGeo = new THREE.BoxGeometry(8.5, 0.35, 4.0);
  var archUnderside = new THREE.Mesh(archUndersideGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
  archUnderside.position.set(0.1, 6.15, 0);
  portalGroup.add(archUnderside);

  // 3D Golden Lettering on the Living Wall: "THE Bilwa PROJECT"
  var signPlateGeo = new THREE.BoxGeometry(2.2, 1.2, 0.15);
  var signPlate = new THREE.Mesh(signPlateGeo, charcoalFrameMat);
  signPlate.position.set(-4.5, 3.8, 1.48);
  portalGroup.add(signPlate);

  // Golden Letter Plaques (Emulated via precision metallic blocks)
  var bilwaGoldGeo = new THREE.BoxGeometry(1.8, 0.45, 0.08);
  var bilwaGold = new THREE.Mesh(bilwaGoldGeo, goldLettersMat);
  bilwaGold.position.set(-4.5, 3.9, 1.58);
  portalGroup.add(bilwaGold);

  var projectSubGeo = new THREE.BoxGeometry(1.2, 0.2, 0.08);
  var projectSub = new THREE.Mesh(projectSubGeo, goldLettersMat);
  projectSub.position.set(-4.5, 3.45, 1.58);
  portalGroup.add(projectSub);

  // Perimeter Security Slatted Wall (extending left and right)
  var wallLGeo = new THREE.BoxGeometry(20, 3.2, 0.4);
  var wallL = new THREE.Mesh(wallLGeo, charcoalFrameMat);
  wallL.position.set(-16.0, 1.6, 0);
  wallL.castShadow = true;
  portalGroup.add(wallL);

  var wallRGeo = new THREE.BoxGeometry(22, 3.2, 0.4);
  var wallR = new THREE.Mesh(wallRGeo, charcoalFrameMat);
  wallR.position.set(16.5, 1.6, 0);
  wallR.castShadow = true;
  portalGroup.add(wallR);

  root.add(portalGroup);

  // ── 5. RESIDENTIAL BALCONY GREENERY (Potted plants on selected balconies) ──
  var plantGeo = new THREE.DodecahedronGeometry(0.35, 0);
  var plantMat = new THREE.MeshStandardMaterial({ color: 0x3d7a48, roughness: 0.9 });
  for (var p = 0; p < 18; p++) {
    var plant = new THREE.Mesh(plantGeo, plantMat);
    var rx = (p % 3 === 0 ? -14.0 : (p % 3 === 1 ? 0.0 : 14.5)) + ((p % 2 === 0 ? 1 : -1) * 3.5);
    var ry = podiumHeight + (2 + (p % 10)) * floorHeight + 0.35;
    var rz = (p % 3 === 1 ? 13.5 : 11.5);
    plant.position.set(rx, ry, rz);
    root.add(plant);
  }

  Apartment3D.scene.add(root);
  Apartment3D.buildingGroup = root;
}

/**
 * Setup Catmull-Rom Cubic Spline for Entrance Fly-Through
 */
function setupSplines() {
  var pList = Apartment3D.splinePoints.map(function (p) {
    return new THREE.Vector3(p.x, p.y, p.z);
  });
  Apartment3D.flySpline = new THREE.CatmullRomCurve3(pList);
  Apartment3D.flySpline.curveType = 'catmullrom';
  Apartment3D.flySpline.tension = 0.45;

  var lList = Apartment3D.lookAtSplinePoints.map(function (p) {
    return new THREE.Vector3(p.x, p.y, p.z);
  });
  Apartment3D.lookAtSpline = new THREE.CatmullRomCurve3(lList);
  Apartment3D.lookAtSpline.curveType = 'catmullrom';
  Apartment3D.lookAtSpline.tension = 0.45;
}

/**
 * UI Controls Overlay inside .house-photo-frame
 */
function setupUI() {
  var overlay = document.createElement('div');
  overlay.className = 'apartment-3d-ui-overlay';
  overlay.innerHTML = [
    '<div class="a3d-top-bar">',
    '  <span class="a3d-badge">',
    '    <span class="a3d-badge-pulse"></span>',
    '    <span class="a3d-badge-text">3D Interactive Exterior</span>',
    '  </span>',
    '  <button type="button" class="a3d-btn a3d-btn-toggle-photo" title="Switch to photograph">',
    '    <span class="a3d-btn-icon">📷</span> <span class="a3d-btn-label">Original Photo</span>',
    '  </button>',
    '</div>',
    '<div class="a3d-hint" id="a3d-hint">',
    '  <span class="a3d-hint-icon">↺</span> Drag to Rotate · Pinch to Zoom',
    '</div>',
    '<div class="a3d-bottom-bar">',
    '  <button type="button" class="a3d-btn a3d-btn-fly" id="a3d-fly-btn">',
    '    <span class="a3d-btn-icon">✈️</span> <span>Fly into Entrance</span>',
    '  </button>',
    '  <button type="button" class="a3d-btn a3d-btn-reset" id="a3d-reset-btn" title="Reset View">',
    '    <span>↺</span>',
    '  </button>',
    '  <button type="button" class="a3d-btn a3d-btn-skip" id="a3d-skip-btn">',
    '    <span>Skip to Welcome →</span>',
    '  </button>',
    '</div>'
  ].join('');

  Apartment3D.container.appendChild(overlay);
  Apartment3D.uiOverlay = overlay;

  // Button event listeners
  var flyBtn = overlay.querySelector('#a3d-fly-btn');
  if (flyBtn) {
    flyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      startEntranceFlyIn();
    });
  }

  var resetBtn = overlay.querySelector('#a3d-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function (e) {
      e.preventDefault();
      resetHeroView();
    });
  }

  var skipBtn = overlay.querySelector('#a3d-skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToSection3();
    });
  }

  var togglePhotoBtn = overlay.querySelector('.a3d-btn-toggle-photo');
  if (togglePhotoBtn) {
    togglePhotoBtn.addEventListener('click', function (e) {
      e.preventDefault();
      togglePhotoOr3D(togglePhotoBtn);
    });
  }

  // Auto-fade hint after 4 seconds
  setTimeout(function () {
    var hint = document.getElementById('a3d-hint');
    if (hint) {
      hint.classList.add('a3d-hint-fade');
    }
  }, 4000);
}

/**
 * Toggle between 3D Experience and Static Photo
 */
function togglePhotoOr3D(button) {
  if (!Apartment3D.photoImg || !Apartment3D.canvas) return;

  if (Apartment3D.active) {
    // "📷 Original Photo" clicked — deactivate 3D, go back to static photo
    deactivateThreeD();
  } else {
    // "🌐 3D View" clicked — activate 3D and expand
    activateThreeD();
    // Update button label (shown inside the overlay top-bar)
    button.innerHTML = '<span class="a3d-btn-icon">📷</span> <span class="a3d-btn-label">Original Photo</span>';
  }
}

/**
 * Start Cinematic Catmull-Rom Entrance Gate Fly-In
 */
function startEntranceFlyIn() {
  if (Apartment3D.isFlying) return;

  Apartment3D.isFlying = true;
  Apartment3D.flyStartTime = performance.now();
  if (Apartment3D.controls) {
    Apartment3D.controls.enabled = false;
  }

  var flyBtn = document.getElementById('a3d-fly-btn');
  if (flyBtn) {
    flyBtn.disabled = true;
    flyBtn.innerHTML = '<span class="a3d-btn-icon">⏳</span> <span>Entering Gate...</span>';
  }

  var hint = document.getElementById('a3d-hint');
  if (hint) hint.style.display = 'none';
}

/**
 * Reset Camera to Initial Hero Perspective
 */
function resetHeroView() {
  Apartment3D.isFlying = false;
  if (Apartment3D.controls) {
    Apartment3D.controls.enabled = true;
    Apartment3D.controls.reset();
  }
  Apartment3D.camera.position.set(22.0, 14.0, 38.0);
  if (Apartment3D.controls) {
    Apartment3D.controls.target.set(0.0, 16.0, 0.0);
  }

  var flyBtn = document.getElementById('a3d-fly-btn');
  if (flyBtn) {
    flyBtn.disabled = false;
    flyBtn.innerHTML = '<span class="a3d-btn-icon">✈️</span> <span>Fly into Entrance</span>';
  }
}

/**
 * Smoothly scroll down to Section 3 (Family Welcome / Invitation Card)
 */
function scrollToSection3() {
  var target = document.querySelector('.welcome-section') || document.querySelector('.family-section') || document.getElementById('story-section-2');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Window Resize & Responsive Management
 */
function setupEvents() {
  window.addEventListener('resize', function () {
    if (!Apartment3D.container || !Apartment3D.renderer || !Apartment3D.camera) return;
    var w = Apartment3D.container.clientWidth || 800;
    var h = Apartment3D.active
      ? (Apartment3D.container.clientHeight || (window.innerWidth >= 768 ? 680 : (window.innerWidth >= 480 ? 600 : 520)))
      : Math.max(480, Math.round(w * 0.76));
    Apartment3D.camera.aspect = w / h;
    Apartment3D.camera.updateProjectionMatrix();
    Apartment3D.renderer.setSize(w, h, false);
  });
}

/**
 * Smooth Cubic Ease In-Out
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Main Animation & Render Loop
 */
function animate() {
  Apartment3D.animFrameId = requestAnimationFrame(animate);

  if (!Apartment3D.active) return;

  if (Apartment3D.isFlying) {
    var now = performance.now();
    var elapsed = now - Apartment3D.flyStartTime;
    var t = Math.min(1.0, elapsed / Apartment3D.flyDuration);
    var easedT = easeInOutCubic(t);

    // Interpolate camera position along Catmull-Rom spline
    var pos = Apartment3D.flySpline.getPointAt(easedT);
    Apartment3D.camera.position.copy(pos);

    // Interpolate lookAt target along lookAt spline
    var look = Apartment3D.lookAtSpline.getPointAt(easedT);
    Apartment3D.camera.lookAt(look);

    // Check for completion & gate cross
    if (t >= 0.88 && !Apartment3D.canvas.dataset.gateTriggered) {
      Apartment3D.canvas.dataset.gateTriggered = 'true';
      // Gentle celebratory flash / transition to next section
      setTimeout(function () {
        scrollToSection3();
        if (window.PuttaWelcomeVideo && typeof window.PuttaWelcomeVideo.playFromGateArrival === 'function') {
          window.PuttaWelcomeVideo.playFromGateArrival();
        }
      }, 400);
    }

    if (t >= 1.0) {
      Apartment3D.isFlying = false;
      delete Apartment3D.canvas.dataset.gateTriggered;
      var flyBtn = document.getElementById('a3d-fly-btn');
      if (flyBtn) {
        flyBtn.disabled = false;
        flyBtn.innerHTML = '<span class="a3d-btn-icon">✈️</span> <span>Fly into Entrance</span>';
      }
      if (Apartment3D.controls) {
        Apartment3D.controls.enabled = true;
        Apartment3D.controls.target.copy(look);
      }
    }
  } else if (Apartment3D.controls) {
    Apartment3D.controls.update();
  }

  Apartment3D.renderer.render(Apartment3D.scene, Apartment3D.camera);
}

/**
 * Accurate Geometry VRAM Byte Measurement (ENG-3D-MAPS-BILWA-V3)
 */
function getGpuMemoryStats() {
  if (!Apartment3D.scene || !Apartment3D.renderer) return null;

  var geometryBytes = 0;
  var meshCount = 0;

  Apartment3D.scene.traverse(function (obj) {
    if (obj.isMesh && obj.geometry) {
      meshCount++;
      var geom = obj.geometry;
      for (var name in geom.attributes) {
        var attr = geom.attributes[name];
        if (attr && attr.array) {
          geometryBytes += attr.array.byteLength;
        }
      }
      if (geom.index && geom.index.array) {
        geometryBytes += geom.index.array.byteLength;
      }
    }
  });

  return {
    geometryBytes: geometryBytes,
    geometryKB: (geometryBytes / 1024).toFixed(2),
    geometryMB: (geometryBytes / (1024 * 1024)).toFixed(3),
    meshCount: meshCount,
    activeGeometriesCount: Apartment3D.renderer.info.memory.geometries,
    activeTexturesCount: Apartment3D.renderer.info.memory.textures
  };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose global interface for debugging or external triggers
window.BilwaApartment3D = {
  init: init,
  activate3D: activateThreeD,
  deactivate3D: deactivateThreeD,
  flyToEntrance: startEntranceFlyIn,
  resetView: resetHeroView,
  togglePhoto: togglePhotoOr3D,
  getMemoryStats: getGpuMemoryStats,
  instance: Apartment3D
};

}) (window, document);
