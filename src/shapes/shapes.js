import * as THREE from 'three';

export function createDashedCircleMesh(radius, segments, rotation) {
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

export function createStarMesh(radius, color, coords, segments=16) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshBasicMaterial({ color });

    const star = new THREE.Mesh(geometry, material);
    star.position.set(...Object.values(coords));

    return star
}

export function createSelectorMesh(color=0xfffff, radius=0.2, width=0.02, segments=32) {
    const geometry = new THREE.RingGeometry(0.2, 0.22, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xfffff, side: THREE.DoubleSide });

    const selector = new THREE.Mesh(geometry, material);
    selector.visible = false;
    selector.rotation.set(Math.PI / 2, 0, 0);
    return selector
}

export function multiRaycast(mouse, camera, objects, raycaster, spread = 0.001, steps = 10) {
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