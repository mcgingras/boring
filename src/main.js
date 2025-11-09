import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0000); // Very dark with red tint
// scene.fog = new THREE.Fog(0x220000, 3, 12); // Disabled for Pi performance

const container = document.getElementById("container");
const WIDTH = 1280;
const HEIGHT = 400;

const camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 100);
camera.position.set(0, 3.2, 5);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance",
});
renderer.setSize(WIDTH, HEIGHT);
renderer.setPixelRatio(1); // Force 1:1 pixel ratio for performance
renderer.shadowMap.enabled = false; // Disable shadows for better performance
container.appendChild(renderer.domElement);

// FPS Stats for debugging
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb
stats.dom.style.position = 'absolute';
stats.dom.style.top = '0px';
stats.dom.style.left = '0px';
document.body.appendChild(stats.dom);

// BOILER ROOM LIGHTING - Heavy red atmosphere like the photo
// Very dim ambient with red tint
const ambient = new THREE.AmbientLight(0x330000, 0.4);
scene.add(ambient);

// Key red lights (signature Boiler Room look)
const spotlights = [];

// Main red backlight from ceiling - MUCH BRIGHTER
const mainRedLight = new THREE.SpotLight(0xff0000, 15, 15, Math.PI / 4, 0.6, 1.5);
mainRedLight.position.set(0, 4.5, -2);
const redTarget = new THREE.Object3D();
redTarget.position.set(0, 1, 1);
scene.add(redTarget);
mainRedLight.target = redTarget;
scene.add(mainRedLight);
spotlights.push({ light: mainRedLight, target: redTarget, phase: 0 });

// Side red wash (left) - reduced for performance
const leftRedLight = new THREE.SpotLight(
  0xff0000,
  12,
  12,
  Math.PI / 3,
  0.7,
  1.5
);
leftRedLight.position.set(-4, 3, 0);
const leftTarget = new THREE.Object3D();
leftTarget.position.set(0, 1, 1);
scene.add(leftTarget);
leftRedLight.target = leftTarget;
scene.add(leftRedLight);
spotlights.push({
  light: leftRedLight,
  target: leftTarget,
  phase: Math.PI / 2,
});

// Right red wash REMOVED for Pi performance

// White spotlight on DJ booth - like in the photo
const djSpotlight = new THREE.SpotLight(
  0xffffff,
  25,
  12,
  Math.PI / 8,
  0.3,
  1.5
);
djSpotlight.position.set(0, 4.5, 2);
const djTarget = new THREE.Object3D();
djTarget.position.set(0, 1, 0); // Aimed at DJ booth
scene.add(djTarget);
djSpotlight.target = djTarget;
scene.add(djSpotlight);
spotlights.push({
  light: djSpotlight,
  target: djTarget,
  phase: 0,
});

// No fill light - keep it dark and moody like the photo

// Industrial concrete floor - Boiler Room style
const floorGeo = new THREE.PlaneGeometry(10, 10);
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 128;
const ctx = canvas.getContext("2d");

// Base concrete gray
ctx.fillStyle = "#2a2a2a";
ctx.fillRect(0, 0, 128, 128);

// Add some subtle texture/noise for concrete effect
for (let i = 0; i < 800; i++) {
  const x = Math.random() * 128;
  const y = Math.random() * 128;
  const shade = Math.random() > 0.5 ? "#333333" : "#252525";
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, 2, 2);
}

const floorTexture = new THREE.CanvasTexture(canvas);
const floorMat = new THREE.MeshStandardMaterial({
  map: floorTexture,
  roughness: 0.9,
  metalness: 0.1,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// DJ BOOTH - Boiler Room style
const boothWidth = 2;
const boothHeight = 1;
const boothDepth = 0.8;

// Main table surface
const tableSurface = new THREE.Mesh(
  new THREE.BoxGeometry(boothWidth, 0.05, boothDepth),
  new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.7,
    metalness: 0.2,
  })
);
tableSurface.position.set(0, boothHeight, 0);
scene.add(tableSurface);

// Table legs (4 corners)
const legGeo = new THREE.BoxGeometry(0.05, boothHeight, 0.05);
const legMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a0a,
  roughness: 0.8,
  metalness: 0.1,
});

const legPositions = [
  [-boothWidth / 2 + 0.1, boothHeight / 2, -boothDepth / 2 + 0.1],
  [boothWidth / 2 - 0.1, boothHeight / 2, -boothDepth / 2 + 0.1],
  [-boothWidth / 2 + 0.1, boothHeight / 2, boothDepth / 2 - 0.1],
  [boothWidth / 2 - 0.1, boothHeight / 2, boothDepth / 2 - 0.1],
];

legPositions.forEach((pos) => {
  const leg = new THREE.Mesh(legGeo, legMat);
  leg.position.set(pos[0], pos[1], pos[2]);
  scene.add(leg);
});

// CDJ DECKS & MIXER - Boiler Room style
const cdjHeight = 0.08;
const cdjWidth = 0.35;
const cdjDepth = 0.35;

// Left CDJ (Pioneer style)
const leftCDJ = new THREE.Mesh(
  new THREE.BoxGeometry(cdjWidth, cdjHeight, cdjDepth),
  new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.5,
    metalness: 0.3,
  })
);
leftCDJ.position.set(-0.55, boothHeight + 0.025 + cdjHeight / 2, 0.1);
scene.add(leftCDJ);

// Left CDJ screen (blue LCD - emissive)
const leftScreen = new THREE.Mesh(
  new THREE.BoxGeometry(0.25, 0.001, 0.15),
  new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    emissive: 0x0088cc,
    emissiveIntensity: 1,
    roughness: 0.2,
  })
);
leftScreen.position.set(-0.55, boothHeight + 0.025 + cdjHeight + 0.001, 0.05);
scene.add(leftScreen);

// Right CDJ
const rightCDJ = new THREE.Mesh(
  new THREE.BoxGeometry(cdjWidth, cdjHeight, cdjDepth),
  new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.5,
    metalness: 0.3,
  })
);
rightCDJ.position.set(0.55, boothHeight + 0.025 + cdjHeight / 2, 0.1);
scene.add(rightCDJ);

// Right CDJ screen (blue LCD - emissive)
const rightScreen = new THREE.Mesh(
  new THREE.BoxGeometry(0.25, 0.001, 0.15),
  new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    emissive: 0x0088cc,
    emissiveIntensity: 1,
    roughness: 0.2,
  })
);
rightScreen.position.set(0.55, boothHeight + 0.025 + cdjHeight + 0.001, 0.05);
scene.add(rightScreen);

// Mixer (center)
const mixer = new THREE.Mesh(
  new THREE.BoxGeometry(0.4, cdjHeight, 0.25),
  new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.6,
    metalness: 0.4,
  })
);
mixer.position.set(0, boothHeight + 0.025 + cdjHeight / 2, -0.15);
scene.add(mixer);

// Mixer faders (simple representation - emissive red)
for (let i = 0; i < 3; i++) {
  const fader = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.01, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0x330000,
      emissiveIntensity: 0.5,
      roughness: 0.4,
    })
  );
  fader.position.set(
    -0.12 + i * 0.12,
    boothHeight + 0.025 + cdjHeight + 0.005,
    -0.15
  );
  scene.add(fader);
}

// WAREHOUSE WALLS - Dark industrial Boiler Room style
const wallMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.9,
  metalness: 0.1,
});

// Back wall (behind DJ booth)
const backWallGeo = new THREE.PlaneGeometry(12, 5);
const backWall = new THREE.Mesh(backWallGeo, wallMat);
backWall.position.set(0, 2.5, -4);
scene.add(backWall);

// Left wall
const sideWallGeo = new THREE.PlaneGeometry(12, 5);
const leftWall = new THREE.Mesh(sideWallGeo, wallMat);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.set(-6, 2.5, 2);
scene.add(leftWall);

// Right wall
const rightWall = new THREE.Mesh(sideWallGeo, wallMat);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.set(6, 2.5, 2);
scene.add(rightWall);

// Ceiling
const ceilingGeo = new THREE.PlaneGeometry(12, 12);
const ceilingMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a0a,
  roughness: 1,
  metalness: 0,
});
const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 5;
scene.add(ceiling);

// BOILER ROOM LOGO - Iconic red circle with text on back wall
const logoRadius = 0.4;

// Create canvas for logo with text
const logoCanvas = document.createElement('canvas');
logoCanvas.width = logoCanvas.height = 256;
const logoCtx = logoCanvas.getContext('2d');

// Draw red circle background
logoCtx.fillStyle = '#ff0000';
logoCtx.beginPath();
logoCtx.arc(128, 128, 128, 0, Math.PI * 2);
logoCtx.fill();

// Draw "BOILER ROOM" text
logoCtx.fillStyle = '#ffffff';
logoCtx.textAlign = 'center';
logoCtx.textBaseline = 'middle';
logoCtx.font = 'bold 32px Arial';
logoCtx.fillText('BOILER', 128, 108);
logoCtx.fillText('ROOM', 128, 148);

const logoTexture = new THREE.CanvasTexture(logoCanvas);
const logoGeo = new THREE.CircleGeometry(logoRadius, 32);
const logoMat = new THREE.MeshStandardMaterial({
  map: logoTexture,
  emissive: 0x330000,
  emissiveIntensity: 0.5,
  roughness: 0.3,
});
const logo = new THREE.Mesh(logoGeo, logoMat);
logo.position.set(2.5, 3.5, -3.99); // On back wall, upper right
scene.add(logo);

// Add subtle glow ring around logo
const glowRingGeo = new THREE.RingGeometry(logoRadius, logoRadius + 0.05, 32);
const glowRingMat = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.3,
});
const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
glowRing.position.set(2.5, 3.5, -3.98);
scene.add(glowRing);

// VERTICAL RED LED STRIPS - Like in Boiler Room photo (emissive only, no point lights for performance)
const ledStripPositions = [-3, -1.5, 1.5, 3]; // 4 vertical strips
ledStripPositions.forEach((xPos) => {
  // LED strip geometry - emissive material only
  const stripGeo = new THREE.PlaneGeometry(0.08, 4);
  const stripMat = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 2,
  });
  const strip = new THREE.Mesh(stripGeo, stripMat);
  strip.position.set(xPos, 2.5, -3.95);
  scene.add(strip);
});

// Controls - damping disabled for performance
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;

// Loader
const loader = new GLTFLoader();
const mixers = [];

// Helper function to setup dancer materials - realistic lighting
function setupDancerMaterials(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      // Use MeshStandardMaterial for realistic lighting
      if (child.material) {
        const oldMaterial = child.material;
        child.material = new THREE.MeshStandardMaterial({
          color: oldMaterial.color || 0xcccccc,
          map: oldMaterial.map,
          metalness: 0,
          roughness: 0.8,
          skinning: true,
        });
      }
    }
  });
}

// BOILER ROOM CROWD - positioned behind DJ booth
// Helper function to load crowd member
function loadCrowdMember(modelPath, position, rotation = 0) {
  loader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      setupDancerMaterials(model);
      model.position.set(position[0], position[1], position[2]);
      model.rotation.y = rotation;
      scene.add(model);

      const mixer = new THREE.AnimationMixer(model);
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }
      mixers.push(mixer);
    },
    undefined,
    (error) => console.error("Error loading crowd member:", error)
  );
}

// Crowd arranged in semi-circle behind DJ booth - REDUCED FOR PERFORMANCE
// Just 4 dancers instead of 8
loadCrowdMember("/biped/Animation_All_Night_Dance_withSkin.glb", [-1.2, 0, 2], 0);
loadCrowdMember("/biped/Animation_Boom_Dance_withSkin.glb", [-0.4, 0, 2], 0);
loadCrowdMember("/biped/Untitled.glb", [0.4, 0, 2], 0);
loadCrowdMember("/biped/Animation_All_Night_Dance_withSkin.glb", [1.2, 0, 2], 0);

// Music (optional)
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load("/song.mp3", (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
  sound.play();
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  stats.begin(); // Start FPS monitoring

  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Update all animation mixers
  mixers.forEach((mixer) => mixer.update(delta));

  // Spotlight animations DISABLED for Pi performance
  // spotlights.forEach((spotlight, i) => {
  //   const radius = 0.5;
  //   const speed = 0.2 + i * 0.1;
  //   spotlight.target.position.x =
  //     Math.cos(time * speed + spotlight.phase) * radius;
  //   spotlight.target.position.z =
  //     1 + Math.sin(time * speed + spotlight.phase) * radius;
  //   const intensity = 1.5 + Math.sin(time * 1.5 + spotlight.phase) * 0.5;
  //   spotlight.light.intensity = intensity;
  // });

  controls.update();
  renderer.render(scene, camera);

  stats.end(); // End FPS monitoring
}
animate();

// Fixed size for dream-recorder compatibility - no resize needed
