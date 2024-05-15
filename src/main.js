import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { sample } from './10_pc_sample';
import { wiki } from './10_pc_wiki';

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
    'Planet': 'suspected exoplanet',
};

const stars = [];

function placeStar(i) {
	const s = sample[i]
    const primary = Object.values(s.objs)[0];
    let spec_type = primary.spectral_type
        ? primary.spectral_type.replace('>', '').replace('sd', '').replace(' ', '').replace('=', '')[0]
        : undefined;
    let cat = primary.cat.replace('?', '');
    let type = spec_type || cat;
    let color = color_map[type];

    let radius = ['BD', 'WD', 'LM'].includes(cat) ? 0.02 : 0.04;

    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    const star = new THREE.Mesh(geometry, material);
    star.position.set(s.x, s.y, s.z);
    scene.add(star);

    star.name = i
    stars.push(star);
}

Object.keys(sample).forEach(placeStar);

function createDashedCircle(radius, segments, rotation) {
    const geometry = new THREE.CircleGeometry(radius, segments);

    const itemSize = 3;
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(
            geometry.attributes.position.array.slice(itemSize, geometry.attributes.position.array.length - itemSize),
            itemSize
        )
    );
    geometry.index = null;

    const material = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.1, gapSize: 0.5 });
    const line = new THREE.LineLoop(geometry, material);
    line.rotation.set(rotation.x, rotation.y, rotation.z);

    line.computeLineDistances();
    return line;
}

const equator = createDashedCircle(10, 64, new THREE.Vector3(Math.PI / 2, 0, 0));
scene.add(equator);


function multiRaycast(mouse, camera, objects, raycaster, spread = 0.001, steps = 10) {
    const intersects = [];
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

const selectorGeometry = new THREE.RingGeometry(0.2, 0.22, 32);
const selectorMaterial = new THREE.MeshBasicMaterial({ color: 0xfffff, side: THREE.DoubleSide });
const selectorCircle = new THREE.Mesh(selectorGeometry, selectorMaterial);
selectorCircle.visible = false;
selectorCircle.rotation.set(Math.PI / 2, 0, 0);
scene.add(selectorCircle);

const DEFAULT_INFO = 'Click and drag to rotate.<br>Scroll to zoom.<br><strong>Click</strong> a star for more information.' +
'<br><br><small>Source: The 10 parsec sample in the Gaia era' +
'<br>C. Reylé, K. Jardine, P. Fouqué, J. A. Caballero, R. L. Smart, A. Sozzetti' +
'<br>A&A 650 A201 (2021)' +
'<br>DOI: 10.1051/0004-6361/202140985'
const infoBox = document.getElementById('info');
infoBox.innerHTML = DEFAULT_INFO

function getDesc(i) {
	const s = sample[i]
	let desc = `<strong>${s.name}</strong><br>distance: ${Math.sqrt(s.x ** 2 + s.y ** 2 + s.z ** 2).toFixed(2)} pc`;

    desc += `<br><br>This system consists of the following bodies:<small><br>`

    for (let j in s.objs) {
        const obj = s.objs[j];
        desc +=
            `<strong>${obj.name}</strong> (${type_map[obj.cat.replace('?', '')]})` +
            (obj.spectral_type ? `<br>spectral type: ${obj.spectral_type}` : '') +
            (obj.luminosity ? `<br>luminosity: ${obj.luminosity.toFixed(3)} L☉` : '') +
			'<br><br>';
    }

	const wiki_entry = wiki[s.name]
	if (wiki_entry) {
		// for (link in wiki_entry.links) {
		// 	summary.replace(link, `<a href="https://en.wikipedia.org/wiki/${link}">${link}</a>`)
		// }

		let summary = wiki_entry.summary.replace(/\n/g, '<br><br>')
		console.log(summary.length, summary[0].length)
		if (summary.length > 1200) {
			summary = summary.substring(0, 1200) + '...'
		}

		desc += '</small>The following is courtesy of Wikipedia:'
		desc += `<br><strong><a href=https://en.wikipedia.org/wiki/${wiki_entry.title}>` + wiki_entry.title + '</a></strong>'
		desc += '<br><small>' + summary + '</small>'
	} else {
		desc += '</small>This minor system does not have a Wikipedia page assosciated with it.'
	}

	return desc
}

window.addEventListener('click', onMouseMove, false);
function onMouseMove(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const intersects = multiRaycast(mouse, camera, stars, raycaster);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        selectorCircle.position.copy(intersectedObject.position);
        selectorCircle.visible = true;

        infoBox.innerHTML = getDesc(intersectedObject.name)
    } else {
		infoBox.innerHTML = DEFAULT_INFO
	}
}

camera.position.set(0, 0, 20);
controls.update();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();