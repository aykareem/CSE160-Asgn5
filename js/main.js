import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// ------------------- SCENE & FOG ------------------- //
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcccccc, 15, 60);

// ------------------- SKYBOX ------------------- //
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath(
  'https://raw.githubusercontent.com/mrdoob/three.js/r152/examples/textures/cube/skyboxsun25deg/'
);
scene.background = cubeTextureLoader.load([
  'px.jpg', 'nx.jpg',
  'py.jpg', 'ny.jpg',
  'pz.jpg', 'nz.jpg'
]);

// ------------------- CAMERA ------------------- //
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 8, 25);

// ------------------- RENDERER ------------------- //
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ------------------- LIGHTS ------------------- //
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(15, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xff0000, 1, 50);
pointLight.position.set(-10, 10, 0);
pointLight.castShadow = true;
scene.add(pointLight);

// ------------------- GROUND (GREEN) ------------------- //
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshPhongMaterial({ color: 0x228B22 }); // solid green for grass
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// Arrays for interactivity
const spinObjects = [];      // objects that spin
const clickableObjects = []; // objects that respond to clicks

function createMesh(geometry, material, x, y, z, canSpin = false, canClick = false) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (canSpin) spinObjects.push(mesh);
  if (canClick) clickableObjects.push(mesh);
  scene.add(mesh);
  return mesh;
}

// -------------------------------------------------- //
// 1) Original 4 Shapes
// -------------------------------------------------- //

// (A) Green Cube (spins & clickable)
{
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
  createMesh(geometry, material, -5, 0, 0, true, true);
}

// (B) Textured Crate Cube (spins, not clickable so its texture remains)
{
  const textureLoader = new THREE.TextureLoader();
  const crateTexture = textureLoader.load('https://threejs.org/examples/textures/crate.gif');
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshPhongMaterial({ map: crateTexture });
  createMesh(geometry, material, -2, 0, 0, true, false);
}

// (C) Blue Sphere (spins & clickable)
{
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
  createMesh(geometry, material, 1, 0, 0, true, true);
}

// (D) Yellow Cylinder (spins & clickable)
{
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
  const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
  createMesh(geometry, material, 4, 0, 0, true, true);
}

// -------------------------------------------------- //
// 2) Slide Parts (Separate: platform, ramp, steps)
// -------------------------------------------------- //
const slideMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

// (A) Platform
const platformGeo = new THREE.BoxGeometry(2, 0.2, 2);
const platform = createMesh(platformGeo, slideMaterial, 9.7, -1.05, 0, false, false);

// (B) Ramp
const rampGeo = new THREE.BoxGeometry(2, 0.2, 2);
const ramp = createMesh(rampGeo, slideMaterial, 11.5, -1.6, 0.1, false, false);
ramp.rotation.x = -Math.PI / 5;  // tilt the ramp

// (C) Steps (4 boxes)
for (let i = 0; i < 4; i++) {
  const stepGeo = new THREE.BoxGeometry(0.3, 0.2, 2);
  createMesh(stepGeo, slideMaterial, 7.7 + i * 0.3, -1.8 + i * 0.25, 0, false, false);
}

// -------------------------------------------------- //
// 3) Seesaw (No spin, no click)
{
  const pivotGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16);
  const pivotMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
  createMesh(pivotGeo, pivotMat, 0, -1.5, -8, false, false);

  const plankGeo = new THREE.BoxGeometry(4, 0.2, 0.5);
  const plankMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const plank = createMesh(plankGeo, plankMat, 0, -1.3, -8, false, false);
  plank.rotation.z = Math.PI / 12;
}

// -------------------------------------------------- //
// 4) Fence (No spin, no click)
{
  const fenceCount = 15;
  const radius = 25;
  for (let i = 0; i < fenceCount; i++) {
    const angle = (i / fenceCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const fenceGeo = new THREE.BoxGeometry(0.3, 3, 0.3);
    const fenceMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    createMesh(fenceGeo, fenceMat, x, -0.5, z, false, false);
  }
}

// -------------------------------------------------- //
// 5) 20 Dancing Objects (Animate them moving around)
// -------------------------------------------------- //
const dancingObjects = [];

function createDancingObjects() {
  const geometryOptions = [
    () => new THREE.BoxGeometry(0.6, 0.6, 0.6),
    () => new THREE.SphereGeometry(0.5, 16, 16),
    () => new THREE.ConeGeometry(0.4, 1, 16),
    () => new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16),
    () => new THREE.TorusGeometry(0.4, 0.15, 16, 32)
  ];

  for (let i = 0; i < 20; i++) {
    const geoFunc = geometryOptions[Math.floor(Math.random() * geometryOptions.length)];
    const geometry = geoFunc();
    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
    const material = new THREE.MeshPhongMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      orbitRadius: 5 + Math.random() * 15,
      angleOffset: Math.random() * Math.PI * 2,
      baseY: -2 + Math.random() * 4,
      bobAmplitude: 0.5,
      orbitSpeed: 0.3 + Math.random() * 0.4,
      bobSpeed: 0.5 + Math.random() * 0.5
    };
    scene.add(mesh);
    dancingObjects.push(mesh);
  }
}
createDancingObjects();

// -------------------------------------------------- //
// 6) Billboard (Always Faces the Camera)
// -------------------------------------------------- //
function createBillboard(textureUrl, width, height, x, y, z) {
  const texture = new THREE.TextureLoader().load(textureUrl);
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  const billboard = new THREE.Mesh(geometry, material);
  billboard.position.set(x, y, z);
  scene.add(billboard);
  return billboard;
}
const billboard = createBillboard('https://threejs.org/examples/textures/sprite0.png', 3, 2, -10, 3, -5);

// -------------------------------------------------- //
// 7) Custom Model: Walt Head (Loaded via URL)
// -------------------------------------------------- //
const mtlLoader = new MTLLoader();
mtlLoader.load(
  'https://threejs.org/examples/models/obj/walt/WaltHead.mtl',
  (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(
      'https://threejs.org/examples/models/obj/walt/WaltHead.obj',
      (object) => {
        object.scale.set(0.5, 0.5, 0.5);
        object.position.set(0, -2, -10);
        scene.add(object);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded (WaltHead OBJ)');
      },
      (error) => {
        console.error('WaltHead OBJ Load Error:', error);
      }
    );
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded (WaltHead MTL)');
  },
  (error) => {
    console.error('WaltHead MTL Load Error:', error);
  }
);

// -------------------------------------------------- //
// ORBIT CONTROLS
// -------------------------------------------------- //
const controls = new OrbitControls(camera, renderer.domElement);

// -------------------------------------------------- //
// OBJECT PICKING (Click to Change Color for clickableObjects)
// -------------------------------------------------- //
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);
  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    intersected.material.color.setHex(Math.random() * 0xffffff);
  }
});

// -------------------------------------------------- //
// ANIMATION LOOP
// -------------------------------------------------- //
function animate() {
  requestAnimationFrame(animate);

  // Spin only the objects in spinObjects
  spinObjects.forEach((obj) => {
    obj.rotation.y += 0.01;
  });

  // Animate dancing objects
  const time = performance.now() * 0.001;
  dancingObjects.forEach((obj) => {
    const { orbitRadius, angleOffset, baseY, bobAmplitude, orbitSpeed, bobSpeed } = obj.userData;
    const angle = angleOffset + time * orbitSpeed;
    obj.position.x = orbitRadius * Math.cos(angle);
    obj.position.z = orbitRadius * Math.sin(angle);
    obj.position.y = baseY + Math.sin(time * bobSpeed) * bobAmplitude;
  });

  // Update billboard to always face the camera
  billboard.lookAt(camera.position);

  controls.update();
  renderer.render(scene, camera);
}
animate();

// -------------------------------------------------- //
// WINDOW RESIZE
// -------------------------------------------------- //
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
