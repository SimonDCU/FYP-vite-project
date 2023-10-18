import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import { VRButton } from 'three/examples/jsm/webxr/VRButton'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';



// Scene
const scene = new THREE.Scene();

//Create object
// const geometry = new THREE.SphereGeometry(3, 64, 64);
// const material = new THREE.MeshStandardMaterial({
//   color: "#ADD8E6",
// });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);


// // instantiate a loader
// const loader = new OBJLoader();
// // load a resource
// loader.load(
// 	// .obj filepath
// 	'assets/models/12140_Skull_v3_L2.obj',
	
//   // called when resource is loaded
// 	function ( object ) {
//       // Compute the bounding box of the loaded object
//       const box = new THREE.Box3().setFromObject(object);
  
//       // Compute the center of the bounding box
//       const center = new THREE.Vector3();
//       box.getCenter(center);
      
//       // Negate the center vector to translate the object to the origin
//       object.position.sub(center);
//     object.rotateX(-1);
//     // object.position.x(0);
// 		scene.add( object );
// 	},
// 	// called when loading is in progresses
// 	function ( xhr ) {
// 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
// 	},
// 	// called when loading has errors
// 	function ( error ) {
// 		console.log( 'An error happened' );
// 	}
// );


function createSphere() {
  var textureLoader = new THREE.TextureLoader();

  var earthTexture = textureLoader.load('assets/textures/earth_no_clouds.jpg');
  var bumpTexture = textureLoader.load('assets/textures/bump_map.jpg');
  var specularTexture = textureLoader.load('assets/textures/water.png');

  return new THREE.Mesh(
    new THREE.SphereGeometry(3, 64, 64),
    new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.05,
      specularMap: specularTexture,
      specular: new THREE.Color('grey')
    })
  );
}

  var sphere = createSphere();
  sphere.position.set(0, 0, 10);
  scene.add(sphere)
  
// Sizes
const sizes = {
  width : window.innerWidth,
  height : window.innerHeight
}

// Light
// const light = new THREE.PointLight(0xffffff, 300, 200)
// light.position.set(0,10,10)
// scene.add(light)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5,3,5);
scene.add(light);


// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height)
camera.position.z = 20;
camera.lookAt(0,0,0)
// scene.add(camera)


// Render Scene
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height)
renderer.xr.enabled = true
renderer.autoClear = true; // Ensure auto clear is true
renderer.render(scene, camera)


document.body.appendChild(VRButton.createButton(renderer))


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = false
controls.target.set(0, 0, 0);


// Resize
window.addEventListener("resize",() => {
  //Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  //Update camera
  camera.updateProjectionMatrix()
  camera.aspect = sizes.width / sizes.height
  renderer.setSize(sizes.width,sizes.height)
})

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});


console.log("Main script loaded and executed.");
console.log(THREE.REVISION)