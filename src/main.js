import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const container = document.getElementById("container");
const WIDTH = 1280;
const HEIGHT = 400;

const camera = new THREE.PerspectiveCamera(
  60,
  WIDTH / HEIGHT,
  0.1,
  100
);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(WIDTH, HEIGHT);
container.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const spot = new THREE.SpotLight(0xff00ff, 2, 10, Math.PI / 6, 0.3, 2);
spot.position.set(2, 5, 2);
scene.add(spot);

// Dance floor
const floorGeo = new THREE.PlaneGeometry(10, 10);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x222222,
  metalness: 0.3,
  roughness: 0.7,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Loader
const loader = new GLTFLoader();
let mixer;

loader.load(
  "/biped/Animation_All_Night_Dance_withSkin.glb",
  (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
    model.position.y = 0;
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
  },
  (xhr) => console.log(`Loading ${(xhr.loaded / xhr.total) * 100}%`),
  (error) => console.error("Error loading model:", error)
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
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Fixed size for dream-recorder compatibility - no resize needed
