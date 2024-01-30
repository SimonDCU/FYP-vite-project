import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';



// Scene
const scene = new THREE.Scene();

// Define start and end points for camera flight
const startPoint = new THREE.Vector3(-50, -50, 200); // Example start point
const endPoint = new THREE.Vector3(0, 20, 100); // Example end point

// Timing variables for flight
let flightDuration = 3000; // Duration of the flight in milliseconds
let startTime = -1; // Start time of the flight



// // Instantiate a loader
// const loader = new OBJLoader();

// // Load a resource (Skull model)
// loader.load(
//   // .obj filepath
//   'assets/models/12140_Skull_v3_L2.obj',
//   // Called when resource is loaded
//   function (object) {
//     object.rotateX(-1);
//     scene.add(object);
//   },
//   // Called when loading is in progresses
//   function (xhr) {
//     console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//   },
//   // Called when loading has errors
//   function (error) {
//     console.log('An error happened');
//   }
// );


// STL Loader
const loader = new STLLoader();
loader.load('assets/Colon/Colon_scaled_0_4_Cut_1.stl', function (geometry) {
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
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

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height);
camera.position.z = 20; // This initial position might be overwritten


// Camera Dolly
const dolly = new THREE.Object3D();
dolly.position.z = 35;
dolly.add( camera );
scene.add( dolly );

const dummyCam = new THREE.Object3D();
camera.add( dummyCam );


// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.xr.enabled = true;
renderer.autoClear = true;
document.body.appendChild(VRButton.createButton(renderer));



// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = false;
controls.target.set(0, 0, 0);




// Resize Event
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});





let isFlightEnabled = true; // Variable to track if flight is enabled

// Add an event listener to the button
document.getElementById('toggleFlight').addEventListener('click', () => {
  isFlightEnabled = !isFlightEnabled; // Toggle the flight state
});

// Modify the updateFlight function
function updateFlight() {
  if (!isFlightEnabled) return; // Do not update if flight is disabled

  // Calculate elapsed time and progress
  let elapsed = Date.now() - startTime;
  let progress = (elapsed % flightDuration) / flightDuration; // Looping progress

  // Determine direction based on the half cycle
  let isReturning = Math.floor(elapsed / flightDuration) % 2 === 1;

  // Adjust progress based on direction
  if (isReturning) {
    progress = 1 - progress;
  }

  // Interpolate the position
  camera.position.lerpVectors(startPoint, endPoint, progress);
}

// Listen for the VR session start event
renderer.xr.addEventListener('sessionstart', () => {
  camera.position.copy(startPoint); // Set the VR camera to the start point
});

// Animation Loop
renderer.setAnimationLoop(() => {
  // controls.update(); // Orbit controls turned off when flight path is active
  updateFlight(); // Update the camera flight
  renderer.render(scene, camera);
});

// Start the flight
startFlight();

console.log("Main script loaded and executed.");