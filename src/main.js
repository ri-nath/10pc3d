import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import * as shapes from './shapes/shapes';
import { keys, search, DEFAULT_INFO, Star } from './data/data';
import { Handle } from './camera/camera';

// Create a WebGL renderer and set its size to the window dimensions
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a scene, camera, and controls for the 3D view
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);

// Set the initial position of the camera and update the controls
camera.position.set(0, 20, 30);
controls.autoRotate = true
controls.autoRotateSpeed = 0.1
controls.update();

// Create stars based on data and add them to the scene
const stars = keys().map(index => {
    const star = new Star(index)
    const radius = star.getSystemDrawRadius();
    const color = star.getSystemDrawColor();
    const coords = star.getSystemDrawCoordinates();
    const glow = star.getSystemDrawGlowAmnt()

    const mesh = shapes.createStarMesh(radius, color, coords, glow)
    mesh.name = index
    scene.add(mesh)
    return mesh
});

// Create an equator circle and add it to the scene
const equator = shapes.createDashedCircleMesh(10, 64, new THREE.Vector3(Math.PI / 2, 0, 0));
scene.add(equator);

// Create a selector mesh and add it to the scene
const selector = shapes.createSelectorMesh()
selector.visible = false;
scene.add(selector);

// Create a highlight for the Solar System
const highlight = shapes.createSelectorMesh(0xffff00, 0.15);
scene.add(highlight);

// Set the initial content of the info box
const infoBox = document.getElementById('info-text');
infoBox.innerHTML = DEFAULT_INFO

const handle = new Handle(camera, controls)

// Animation loop to continuously update the controls and render the scene
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    handle.update();
    renderer.render(scene, camera);
}
animate();

function selectObject(obj) {
    selector.position.copy(obj.position);
    selector.visible = true;
    infoBox.innerHTML = new Star(obj.name).describeSystem()
}

// Add a click event listener to handle object selection
window.addEventListener('click', event => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Calculate the normalized device coordinates of the mouse click
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Perform raycasting to determine which objects are intersected by the mouse click
    const intersects = shapes.multiRaycast(mouse, camera, stars, raycaster)

    const objIntersects = intersects
      .filter(int => int.object.type != "Sprite")
      .map(int => int.object)
    const spriteIntersects = intersects
      .filter(int => int.object.type == "Sprite")
      .map(int => int.object.parent)
    // If there is an intersection, update the selector position and info box content
    if (objIntersects.length > 0) {
        selectObject(objIntersects[0])
    }
    else if (spriteIntersects.length > 0){
      selectObject(spriteIntersects[0])
    }
}, false);

// Handle searching events
document.addEventListener("DOMContentLoaded", () => {
    // Function to handle search
    function handleSearch() {
      const query = document.getElementById('info-input').value;
      console.log('Search query:', query);
      // Add your search logic here
      const result = search(query);
      console.log(result)
      if (result != undefined) {
        const obj = stars[result]
        selectObject(obj)
        handle.target(obj)
      }
    }

    // Event listener for Enter key press in the input field
    const input = document.getElementById('info-input');
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    });

    // Event listener for click on the search button
    const button = document.getElementById('info-button');
    button.addEventListener('click', handleSearch);

    const home = document.getElementById('home-button');
    home.addEventListener('click', () => {
      const obj = stars[0]
      camera.position.set(0, 20, 30);
      controls.target = obj.position.clone()
      handle.reset()
    })

    const random = document.getElementById('random-button');
    random.addEventListener('click', () => {
      const randomIndex = Math.floor(Math.random() * stars.length);
      const randomStar = stars[randomIndex];
      selectObject(randomStar)
      handle.target(randomStar)
    })
  });