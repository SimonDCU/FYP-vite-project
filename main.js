import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';

let locationArr = [];

// Scene
const scene = new THREE.Scene();


// STL Loader
const loader = new STLLoader();
loader.load('/FYP-vite-project/Colon_scaled_0_4_Cut_1.stl', function (geometry) {
    const material = new THREE.MeshPhongMaterial({ color: 0xff8b9c, side: THREE.DoubleSide });
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
camera.fov = 100;

// Camera Dolly (VR)
const dolly = new THREE.Object3D();
dolly.position.z = 200;
dolly.add( camera );
scene.add( dolly );



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




let controls = new FlyControls( dolly, renderer.domElement );
controls.dragToLook = true;
				controls.movementSpeed = 0.5;
				controls.rollSpeed = 0.0075;



// Resize Event
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});




let pointObjects = [];
let lastPointPosition = null; // Variable to keep track of the last point's position

document.addEventListener('keydown', (event) => {

  // SET POINT
  if (event.key === 'l') {
    const currentPosition = new THREE.Vector3();
    currentPosition.copy(dolly.position);
    locationArr.push(currentPosition);

    // Create the sphere for the current point
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(currentPosition);
    scene.add(sphere);
    pointObjects.push(sphere);

    // If there was a last point, draw a line from it to the current point
    if (lastPointPosition) {
      const lineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([lastPointPosition, currentPosition]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);

      // Optionally, keep track of the line for future removal or manipulation
      pointObjects.push(line);
    }

    // Update the last point position to the current position
    lastPointPosition = currentPosition;
  }



  // CLEAR POINTS
  if (event.key === 'c') {
    // Clear logic for 'c'
    locationArr = [];
    pointObjects.forEach(obj => scene.remove(obj));
    pointObjects = [];
    lastPointPosition = null; // Reset last point position
  }



  // REMOVE LAST POINT
  if (event.key === 'v') {
    // Check if there are objects to remove
    if (pointObjects.length > 0) {
        // Remove the last object, which could be a line or a sphere
        let lastObject = pointObjects.pop();
        scene.remove(lastObject);

        // If the last object was a line (assuming lines are added after spheres),
        // then remove the next object in the array, which should be a sphere.
        if (lastObject instanceof THREE.Line) {
            if (pointObjects.length > 0) {
                lastObject = pointObjects.pop();
                scene.remove(lastObject);
                locationArr.pop(); // Remove the corresponding location
            }
        } else {
            // If the removed object was not a line, it was a sphere, so just remove the location
            locationArr.pop();
        }

        // Update lastPointPosition to the position of the new last sphere, if any
        if (pointObjects.length > 0) {
            const lastSphere = pointObjects[pointObjects.length - 1];
            if (lastSphere instanceof THREE.Mesh) { // Ensure the last object is indeed a sphere
                lastPointPosition = lastSphere.position.clone();
            } else {
                // If the last object is not a sphere, reset lastPointPosition
                lastPointPosition = null;
            }
        } else {
            // If there are no objects left, reset lastPointPosition
            lastPointPosition = null;
        }
        if (pointObjects.length > 0) {
          // Find the last sphere in pointObjects for updating lastPointPosition
          for (let i = pointObjects.length - 1; i >= 0; i--) {
              if (pointObjects[i] instanceof THREE.Mesh) { // Assuming spheres are THREE.Mesh
                  lastPointPosition = new THREE.Vector3().copy(pointObjects[i].position);
                  break;
              }
          }
      } else {
          lastPointPosition = null;
      }
    }
}



// PRINT POINTS ARRAY TO CONSOLE
if (event.key === 'p') {
  console.log(locationArr);
}


});



// Assume locationArr contains THREE.Vector3 objects for the path
let curve; // Will hold the CatmullRomCurve3 based on locationArr
let currentIndex = 0; // Track the current index position on the curve
let curvePoints = []; // All points along the curve
let numberofcurvePoints = 2000;

// Function to initialize or reset the flight path
function initializeFlightPath() {
    if (locationArr.length > 1) {
        curve = new THREE.CatmullRomCurve3(locationArr);
        curvePoints = curve.getPoints(numberofcurvePoints); // Generate points along the curve

        // Create TubeGeometry from the curve
        const tubeGeometry = new THREE.TubeGeometry(curve, 1000, 0.2, 8, false);
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6 });
        const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);

        // Remove the previous path visualization if it exists
        if (window.currentPathMesh) {
            scene.remove(window.currentPathMesh);
        }
        window.currentPathMesh = tubeMesh; // Store the current path mesh to be able to remove it later

        // Add the new path visualization to the scene
        scene.add(tubeMesh);



        currentIndex = 0; // Start at the beginning of the path
        updateCameraToCurrentIndex(); // Update camera position to the start of the path
    }
}

// Function to update camera position based on currentIndex
function updateCameraToCurrentIndex() {
    if (curvePoints.length > 0 && currentIndex >= 0 && currentIndex < curvePoints.length) {
        dolly.position.copy(curvePoints[currentIndex]); // Moving camera location along flightpath

        // Code to make the camera look in the direction where it is going (Best to have off in VR)
        // if (currentIndex < curvePoints.length - 1) {
        //     dolly.lookAt(curvePoints[currentIndex + 1]);
        // } else if (currentIndex > 0) {
        //     dolly.lookAt(curvePoints[currentIndex - 1]);
        // }
    }
}

let flightpathMode = false; // Flag to track if we're in flightpath mode
// Define how many points to move per key press
let flightpathSpeed = 10; // Adjust this value to make the movement faster or slower


// Function to enable/disable FlyControls
function toggleFlyControls(enable) {
  if (controls) {
      controls.enabled = enable;
  }
}

// Function to hide red points
function toggleVisibility(visible) {
  pointObjects.forEach(obj => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.SphereGeometry) {
          obj.visible = visible;
      }
  });
}


// FLIGHTPATH CONTROLS
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
      flightpathMode = true; // Enter flightpath mode
      initializeFlightPath(); // Initialize or reset flight path
      toggleFlyControls(false); // Disable free movement controls
      toggleVisibility(false); // Hide the spheres
  }
  else if (event.key === 'Escape') {
      flightpathMode = false; // Exit flightpath mode
      toggleFlyControls(true); // Re-enable free movement controls
      toggleVisibility(true); // Show the spheres again
  }
  else if ((event.key.toLowerCase() === 'w' || event.key.toLowerCase() === 's') && flightpathMode) {
    // Calculate direction and apply speed
    const direction = event.key.toLowerCase() === 'w' ? 1 : -1;
    currentIndex = Math.max(0, Math.min(curvePoints.length - 1, currentIndex + direction * flightpathSpeed));
    updateCameraToCurrentIndex();
}
});




// let t = 0; // Parameter to represent the position along the curve, ranges from 0 to 1
// let speed = 0.0005; // Speed of movement along the curve

// renderer.setAnimationLoop(() => {
//   if (flightpathMode) {
//       t += speed; // Move forward along the curve
//       if (t > 1) t = 0; // Loop back to start if we reach the end

//       let pos = curve.getPointAt(t); // Get the point at t
//       dolly.position.copy(pos);

//       let lookAtPos = curve.getPointAt((t + 0.01) % 1); // Look a little ahead on the curve
//       dolly.lookAt(lookAtPos);
//   }

//   controls.update(1); // Update controls if needed
//   renderer.render(scene, camera);
// });

// document.addEventListener('keydown', (event) => {
//   if (event.key.toLowerCase() === 'w') speed += 0.0001; // Increase speed
//   if (event.key.toLowerCase() === 's') speed -= 0.0001; // Decrease speed
// });

// Animation Loop
renderer.setAnimationLoop(() => {
  controls.update(1); // The parameter can be the delta time

  renderer.render(scene, camera);
});

console.log("Main script loaded and executed.");