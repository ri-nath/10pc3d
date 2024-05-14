import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { sample } from './10_pc_sample';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);

const color_map = {
	O: 0x9bb0ff,
	B: 0xaabfff,
	A: 0xcad7ff,
	F: 0xf8f7ff,
	G: 0xfff4ea,
	K: 0xffd2a1,
	M: 0xffb56c,
	WD: 0xffffff,
	D: 0xffffff,
	BD: 0x66323d,
	LM: 0x66323d,
	Y: 0x66323d,
	T: 0x66323d,
	L: 0x66323d,
};

// Function to create a star
function placeStar(s: any) {
	const primary: any = Object.values(s.objs)[0];
	let spec_type = primary.spectral_type
		? primary.spectral_type.replace('>', '').replace('sd', '').replace(' ', '').replace('=', '')[0]
		: undefined;
	let cat = primary.cat.replace('?', '');
	let type: keyof typeof color_map = spec_type || cat;
	let color = color_map[type];

	let radius = ['LM', 'BD', 'WD', 'D'].includes(cat) ? 0.03 : 0.05 * primary.luminosity ** 0.25;

	const geometry = new THREE.SphereGeometry(radius, 16, 16);
	const material = new THREE.MeshBasicMaterial({ color });
	const star = new THREE.Mesh(geometry, material);
	star.position.set(s.x, s.y, s.z);
	scene.add(star);
}

// Add stars to the scene
Object.values(sample).forEach(placeStar);

camera.position.set(0, 0, 20);
controls.update(); // controls.update() must be called after any manual changes to the camera's transform

function animate() {
	requestAnimationFrame(animate);
	controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
	renderer.render(scene, camera);
}
animate();
