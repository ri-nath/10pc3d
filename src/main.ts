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

const type_map = {
	'LM': 'low-mass star',
	'BD': 'brown dwarf',
	'*': 'massive star',
	'WD': 'white dwarf',
	'Planet': 'confirmed exoplanet',
};

const stars: THREE.Mesh[] = [];

// Function to create a star
function placeStar(s: any) {
	const primary: any = Object.values(s.objs)[0];
	let spec_type = primary.spectral_type
		? primary.spectral_type.replace('>', '').replace('sd', '').replace(' ', '').replace('=', '')[0]
		: undefined;
	let cat = primary.cat.replace('?', '');
	let type: keyof typeof color_map = spec_type || cat;
	let color = color_map[type];

	let radius = ['BD', 'WD', 'LM'].includes(cat) ? 0.02 : 0.04;

	const geometry = new THREE.SphereGeometry(radius, 16, 16);
	const material = new THREE.MeshBasicMaterial({ color });
	const star = new THREE.Mesh(geometry, material);
	star.position.set(s.x, s.y, s.z);
	scene.add(star);

	star.name = `${s.name}<br>distance: ${Math.sqrt(s.x ** 2 + s.y ** 2 + s.z ** 2).toFixed(2)} pc`;

	console.log(Object.values(s.objs));

	for (let j in s.objs) {
		const obj = s.objs[j];
		star.name +=
			`<br><br>${obj.name} (${type_map[obj.cat.replace('?', '') as keyof typeof type_map]})` +
			(obj.spectral_type ? `<br>- spectral type: ${obj.spectral_type}` : '') +
			(obj.mass ? `<br>- mass: ${obj.mass.toFixed(3)} M☉` : '') +
			(obj.luminosity ? `<br>- luminosity: ${obj.luminosity.toFixed(3)} L☉` : '');
	}
	stars.push(star);
}

Object.values(sample).forEach(placeStar);

// Create dashed circle
function createDashedCircle(radius: number, segments: number, rotation: THREE.Vector3) {
	const geometry = new THREE.CircleGeometry(radius, segments);

	// Remove center vertex. Source: https://stackoverflow.com/questions/13756112/draw-a-circle-not-shaded-with-three-js/75657438#75657438
	const itemSize = 3;
	geometry.setAttribute(
		'position',
		new THREE.BufferAttribute(
			(geometry.attributes.position.array as number[]).slice(itemSize, geometry.attributes.position.array.length - itemSize),
			itemSize
		)
	);
	geometry.index = null;

	const material = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.5 });
	const line = new THREE.LineLoop(geometry, material);
	line.rotation.set(rotation.x, rotation.y, rotation.z); // Apply rotation

	line.computeLineDistances(); // This is necessary to get the dashed effect
	return line;
}

const equator = createDashedCircle(10, 64, new THREE.Vector3(Math.PI / 2, 0, 0));
// const longitudinalLine = createDashedCircle(10, 64, new THREE.Vector3(0, 0, 0));

scene.add(equator);
// scene.add(longitudinalLine);

window.addEventListener('mousemove', onMouseMove, false);

function multiRaycast(
	mouse: THREE.Vector2,
	camera: THREE.PerspectiveCamera,
	objects: THREE.Object3D[],
	raycaster: THREE.Raycaster,
	spread = 0.001,
	steps = 10
): THREE.Intersection[] {
	const intersects: THREE.Intersection[] = [];
	for (let i = -steps; i <= steps; i++) {
		for (let j = -steps; j <= steps; j++) {
			const offsetX = mouse.x + i * spread;
			const offsetY = mouse.y + j * spread;
			raycaster.setFromCamera({ x: offsetX, y: offsetY }, camera);
			intersects.push(...raycaster.intersectObjects(objects));
		}
	}
	return intersects;
}

// Create the selector circle
const selectorGeometry = new THREE.RingGeometry(0.2, 0.22, 32);
const selectorMaterial = new THREE.MeshBasicMaterial({ color: 0xfffff, side: THREE.DoubleSide });
const selectorCircle = new THREE.Mesh(selectorGeometry, selectorMaterial);
selectorCircle.visible = false;
selectorCircle.rotation.set(Math.PI / 2, 0, 0);
scene.add(selectorCircle);

// Reference to the info box
const infoBox = document.getElementById('info');

function onMouseMove(event: MouseEvent): void {
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();

	// Calculate mouse position in normalized device coordinates (-1 to +1) for both components
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	// Calculate objects intersecting the raycaster
	const intersects = multiRaycast(mouse, camera, stars, raycaster);

	if (intersects.length > 0) {
		const intersectedObject = intersects[0].object;
		selectorCircle.position.copy(intersectedObject.position);
		selectorCircle.visible = true;

		infoBox!.innerHTML = (intersectedObject as any).name.replace(',', '<br>');
	}
}

camera.position.set(0, 0, 20);
controls.update(); // controls.update() must be called after any manual changes to the camera's transform

function animate() {
	requestAnimationFrame(animate);
	controls.update(); // required if controls.enableDamping or controls.autoRotate are set to true
	renderer.render(scene, camera);
}
animate();
