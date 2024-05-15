import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import * as data from './data/data';
import * as shapes from './shapes/shapes'

// Create a WebGL renderer and set its size to the window dimensions
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a scene, camera, and controls for the 3D view
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);

// Set the initial position of the camera and update the controls
camera.position.set(0, 0, 20);
controls.update();

// Create stars based on data and add them to the scene
const stars = data.keys().map(index => {
    const radius = data.getSystemDrawRadius(index);
    const color = data.getSystemDrawColor(index);
    const coords = data.getSystemDrawCoordinates(index);

    const star = shapes.createStarMesh(radius, color, coords)
    star.name = index
    scene.add(star)
    return star
});

// Create an equator circle and add it to the scene
const equator = shapes.createDashedCircleMesh(10, 64, new THREE.Vector3(Math.PI / 2, 0, 0));
scene.add(equator);

// Create a selector mesh and add it to the scene
const selector = shapes.createSelectorMesh()
scene.add(selector);

// Set the initial content of the info box
const infoBox = document.getElementById('info');
infoBox.innerHTML = data.DEFAULT_INFO

// Add a click event listener to handle object selection
window.addEventListener('click', event => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Calculate the normalized device coordinates of the mouse click
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Perform raycasting to determine which objects are intersected by the mouse click
    const intersects = shapes.multiRaycast(mouse, camera, stars, raycaster);

    // If there is an intersection, update the selector position and info box content
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        selector.position.copy(intersectedObject.position);
        selector.visible = true;

        infoBox.innerHTML = data.describeSystem(intersectedObject.name)
    }
}, false);

// Animation loop to continuously update the controls and render the scene
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

