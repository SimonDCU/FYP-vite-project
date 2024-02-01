import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import colonSTL from './assets/Colon/Colon_scaled_0_4_Cut_1.stl'


// Scene
const scene = new THREE.Scene();


// STL Loader
const loader = new STLLoader();
loader.load(colonSTL, function (geometry) {
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
});


// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 3, 5);
scene.add(light);


// Default Camera Settings
const defaultCameraPosition = new THREE.Vector3(0, 0, 200);
const defaultCameraRotation = new THREE.Euler(0, 0, 0);


// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height);
// camera.position.z = 120; // This initial position might be overwritten


// Camera Dolly (VR)
const dolly = new THREE.Object3D();
dolly.position.z = 200;
dolly.add( camera );
scene.add( dolly );

// const dummyCam = new THREE.Object3D();
// camera.add( dummyCam );



// Function to create a frame line
function createFrameLine(start, end, color = 0xFFFFFF, thickness = 0.2) {
  const length = start.distanceTo(end);
  const middle = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const geometry = new THREE.CylinderGeometry(thickness, thickness, length, 8, 1, true);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const line = new THREE.Mesh(geometry, material);
  line.position.set(middle.x, middle.y, middle.z);
  line.lookAt(end);
  line.rotateX(Math.PI / 2);
  return line;
}
// Create an array to store the edges
const edgeVertices = [
  new THREE.Vector3(-500, -500, -500),
  new THREE.Vector3(500, -500, -500),
  new THREE.Vector3(500, 500, -500),
  new THREE.Vector3(-500, 500, -500),
  new THREE.Vector3(-500, -500, 500),
  new THREE.Vector3(500, -500, 500),
  new THREE.Vector3(500, 500, 500),
  new THREE.Vector3(-500, 500, 500)
];
// Lines for the cube
const lines = [];
lines.push(createFrameLine(edgeVertices[0], edgeVertices[1]));
lines.push(createFrameLine(edgeVertices[1], edgeVertices[2]));
lines.push(createFrameLine(edgeVertices[2], edgeVertices[3]));
lines.push(createFrameLine(edgeVertices[3], edgeVertices[0]));
lines.push(createFrameLine(edgeVertices[4], edgeVertices[5]));
lines.push(createFrameLine(edgeVertices[5], edgeVertices[6]));
lines.push(createFrameLine(edgeVertices[6], edgeVertices[7]));
lines.push(createFrameLine(edgeVertices[7], edgeVertices[4]));
lines.push(createFrameLine(edgeVertices[0], edgeVertices[4]));
lines.push(createFrameLine(edgeVertices[1], edgeVertices[5]));
lines.push(createFrameLine(edgeVertices[2], edgeVertices[6]));
lines.push(createFrameLine(edgeVertices[3], edgeVertices[7]));

// Add lines to the scene
lines.forEach(line => {
  scene.add(line);
});




// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true // Enable anti-aliasing
});
renderer.setSize(sizes.width, sizes.height);
renderer.xr.enabled = true;
renderer.autoClear = true;
document.body.appendChild(VRButton.createButton(renderer));

let controls
controls = new FlyControls( dolly, renderer.domElement );
				// controls.movementSpeed = 2;
				// controls.lookSpeed = 0.1;



// Resize Event
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});


// // Define a variable to store the camera's rotation
// const cameraRotation = new THREE.Euler();

// // Event listener for keydown events
// document.addEventListener('keydown', (event) => {
//   const speed = 10; // Adjust this value to control the camera movement speed

//   // Get the camera's current rotation
//   cameraRotation.copy(dolly.rotation);

//   if (event.key === 'w') {
//     // Calculate the forward movement vector based on camera's rotation
//     const forward = new THREE.Vector3(0, 0, -1).applyEuler(cameraRotation);
//     dolly.position.add(forward.multiplyScalar(speed));
//   } else if (event.key === 's') {
//     // Calculate the backward movement vector based on camera's rotation
//     const backward = new THREE.Vector3(0, 0, 1).applyEuler(cameraRotation);
//     dolly.position.add(backward.multiplyScalar(speed));
//   } else if (event.key === 'a') {
//     // Calculate the left movement vector based on camera's rotation
//     const left = new THREE.Vector3(-1, 0, 0).applyEuler(cameraRotation);
//     dolly.position.add(left.multiplyScalar(speed));
//   } else if (event.key === 'd') {
//     // Calculate the right movement vector based on camera's rotation
//     const right = new THREE.Vector3(1, 0, 0).applyEuler(cameraRotation);
//     dolly.position.add(right.multiplyScalar(speed));
//   } else if (event.key === 'q') {
//     // Calculate the upward movement vector based on camera's rotation
//     const up = new THREE.Vector3(0, 1, 0).applyEuler(cameraRotation);
//     dolly.position.add(up.multiplyScalar(speed));
//   } else if (event.key === 'e') {
//     // Calculate the downward movement vector based on camera's rotation
//     const down = new THREE.Vector3(0, -1, 0).applyEuler(cameraRotation);
//     dolly.position.add(down.multiplyScalar(speed));
//   } else if (event.key === 'r') {
//     // Reset Camera Position and Rotation to deafualt
//     dolly.position.copy(defaultCameraPosition);
//     camera.rotation.copy(defaultCameraRotation);
//   }

// });

// // Event listener for arrow keys to adjust camera angle
// document.addEventListener('keydown', (event) => {
//   const rotateSpeed = 0.1; // Adjust this value to control the camera rotation speed

//   if (event.key === 'ArrowUp') {
//     camera.rotation.x += rotateSpeed;
//   } else if (event.key === 'ArrowDown') {
//     camera.rotation.x -= rotateSpeed;
//   } else if (event.key === 'ArrowLeft') {
//     camera.rotation.y += rotateSpeed;
//   } else if (event.key === 'ArrowRight') {
//     camera.rotation.y -= rotateSpeed;
//   }
// });





// Animation Loop
renderer.setAnimationLoop(() => {
  controls.update(1); // The parameter can be the delta time

  renderer.render(scene, camera);
});

console.log("Main script loaded and executed.");