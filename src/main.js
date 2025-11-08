import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const container = document.getElementById("container");
const WIDTH = 1280;
const HEIGHT = 400;

const camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 100);
camera.position.set(0, 1.2, 5);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance"
});
renderer.setSize(WIDTH, HEIGHT);
renderer.setPixelRatio(1); // Force 1:1 pixel ratio for performance
renderer.shadowMap.enabled = false; // Disable shadows for better performance
container.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// Reduced spotlights for better performance on Raspberry Pi
const spotlights = [];
const spotlightColors = [0xff00ff, 0x00ffff, 0xff0000];
const spotlightPositions = [
  [2, 4, 2],
  [-2, 4, 2],
  [0, 4, -2],
];

spotlightPositions.forEach((pos, i) => {
  const spot = new THREE.SpotLight(
    spotlightColors[i],
    3,
    12,
    Math.PI / 5,
    0.4,
    2
  );
  spot.position.set(pos[0], pos[1], pos[2]);
  spot.castShadow = false; // Disable shadows for performance
  scene.add(spot);

  // Add target helpers (invisible points the lights aim at)
  const target = new THREE.Object3D();
  target.position.set(0, 0, 0);
  scene.add(target);
  spot.target = target;

  spotlights.push({ light: spot, target: target, phase: (i * Math.PI) / 3 });
});

// Dance floor with simplified checkered pattern
const floorGeo = new THREE.PlaneGeometry(10, 10);
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 128; // Reduced from 512 for performance
const ctx = canvas.getContext("2d");
const tileSize = 16; // Reduced from 64
for (let x = 0; x < 8; x++) {
  for (let y = 0; y < 8; y++) {
    ctx.fillStyle = (x + y) % 2 === 0 ? "#1a1a1a" : "#333333";
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }
}
const floorTexture = new THREE.CanvasTexture(canvas);
const floorMat = new THREE.MeshBasicMaterial({
  map: floorTexture,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Disco ball with reduced geometry
const discoBallGeo = new THREE.SphereGeometry(0.4, 16, 16); // Reduced from 32, 32
const discoBallMat = new THREE.MeshBasicMaterial({
  color: 0xcccccc,
});
const discoBall = new THREE.Mesh(discoBallGeo, discoBallMat);
discoBall.position.set(0, 3.5, 0);
scene.add(discoBall);

// Back wall with neon strips
const wallGeo = new THREE.PlaneGeometry(10, 4);
const wallMat = new THREE.MeshBasicMaterial({
  color: 0x1a1a1a,
});
const backWall = new THREE.Mesh(wallGeo, wallMat);
backWall.position.set(0, 2, -5);
scene.add(backWall);

// Neon strips on back wall - simplified for performance
const neonStrips = [];
const neonLights = [];
const neonColors = [0xff00ff, 0x00ffff, 0xff0000];
for (let i = 0; i < 3; i++) {
  const stripGeo = new THREE.BoxGeometry(8, 0.1, 0.1);
  const stripMat = new THREE.MeshBasicMaterial({
    color: neonColors[i],
  });
  const strip = new THREE.Mesh(stripGeo, stripMat);
  strip.position.set(0, 1 + i * 0.8, -4.9);
  scene.add(strip);
  neonStrips.push(strip);

  // Reduced point light intensity for performance
  const pointLight = new THREE.PointLight(neonColors[i], 1.5, 6);
  pointLight.position.set(0, 1 + i * 0.8, -4.5);
  scene.add(pointLight);
  neonLights.push(pointLight);
}

// Side walls
const sideWallLeft = new THREE.Mesh(wallGeo, wallMat);
sideWallLeft.rotation.y = Math.PI / 2;
sideWallLeft.position.set(-5, 2, 0);
scene.add(sideWallLeft);

const sideWallRight = new THREE.Mesh(wallGeo, wallMat);
sideWallRight.rotation.y = -Math.PI / 2;
sideWallRight.position.set(5, 2, 0);
scene.add(sideWallRight);

// Ceiling
const ceilingGeo = new THREE.PlaneGeometry(10, 10);
const ceilingMat = new THREE.MeshBasicMaterial({
  color: 0x0a0a0a,
});
const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 4;
scene.add(ceiling);

// Controls - damping disabled for performance
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;

// Loader
const loader = new GLTFLoader();
const mixers = [];

// Helper function to setup dancer materials - optimized for Raspberry Pi
function setupDancerMaterials(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      // Simplified material properties for better performance
      if (child.material) {
        child.material.metalness = 0;
        child.material.roughness = 1;
        child.material.needsUpdate = true;
      }
    }
  });
}

// Load center dancer - All Night Dance
loader.load(
  "/biped/Animation_All_Night_Dance_withSkin.glb",
  (gltf) => {
    const model = gltf.scene;
    setupDancerMaterials(model);
    model.position.set(-2, 0, 3);
    scene.add(model);

    const mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
    mixers.push(mixer);
  },
  (xhr) =>
    console.log(`Loading center dancer ${(xhr.loaded / xhr.total) * 100}%`),
  (error) => console.error("Error loading center dancer:", error)
);

// Load left dancer - Boom Dance
loader.load(
  "/biped/Animation_Boom_Dance_withSkin.glb",
  (gltf) => {
    const model = gltf.scene;
    setupDancerMaterials(model);
    model.position.set(0, 0, 2.5);
    scene.add(model);

    const mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
    mixers.push(mixer);
  },
  (xhr) =>
    console.log(`Loading left dancer ${(xhr.loaded / xhr.total) * 100}%`),
  (error) => console.error("Error loading left dancer:", error)
);

// Load right dancer - All Night Dance
loader.load(
  "/biped/Animation_All_Night_Dance_withSkin.glb",
  (gltf) => {
    const model = gltf.scene;
    setupDancerMaterials(model);
    model.position.set(2, 0, 2.5);
    scene.add(model);

    const mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
    mixers.push(mixer);
  },
  (xhr) =>
    console.log(`Loading right dancer ${(xhr.loaded / xhr.total) * 100}%`),
  (error) => console.error("Error loading right dancer:", error)
);

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
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Update all animation mixers
  mixers.forEach((mixer) => mixer.update(delta));

  // Rotate disco ball
  discoBall.rotation.y += delta * 0.5;

  // Animate spotlights in circular patterns
  spotlights.forEach((spotlight, i) => {
    const radius = 2;
    const speed = 0.3 + i * 0.1;
    spotlight.target.position.x =
      Math.cos(time * speed + spotlight.phase) * radius;
    spotlight.target.position.z =
      Math.sin(time * speed + spotlight.phase) * radius;
    spotlight.target.position.y = 0.5;

    // Pulse intensity
    const intensity = 2 + Math.sin(time * 2 + spotlight.phase) * 1;
    spotlight.light.intensity = intensity;
  });

  // Pulse neon lights only (strips use MeshBasicMaterial now)
  neonLights.forEach((light, i) => {
    const pulse = Math.sin(time * 3 + (i * Math.PI) / 3) * 0.5 + 1.5;
    // Sync point light intensity with pulse
    light.intensity = pulse;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Fixed size for dream-recorder compatibility - no resize needed
