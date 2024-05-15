import * as THREE from 'three';
import glow from '../../resources/glow.png'

/**
 * Creates a dashed circle mesh.
 *
 * @param {number} radius - The radius of the circle.
 * @param {number} segments - The number of segments in the circle.
 * @param {THREE.Euler} rotation - The rotation of the circle.
 * @returns {THREE.LineLoop} The dashed circle mesh.
 */
export function createDashedCircleMesh(radius, segments, rotation, color=0xffffff, dashSize=0.1, gapSize=0.5) {
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

    const material = new THREE.LineDashedMaterial({ color, dashSize, gapSize });
    const line = new THREE.LineLoop(geometry, material);
    line.rotation.set(rotation.x, rotation.y, rotation.z);

    line.computeLineDistances();
    return line;
}

/**
 * Creates a star mesh with the specified radius, color, coordinates, and number of segments.
 *
 * @param {number} radius - The radius of the star mesh.
 * @param {string} color - The color of the star mesh.
 * @param {Object} coords - The coordinates of the star mesh, in format { x: number, y: number, z: number },
 *                          with units of parsecs (pc).
 * @param {number} [segments=16] - The number of segments used to create the star mesh.
 * @returns {THREE.Mesh} The created star mesh.
 */
export function createStarMesh(radius, color, coords, glow_amnt=0, segments=16) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshBasicMaterial({ color });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...Object.values(coords));


    // SUPER SIMPLE GLOW EFFECT
	// use sprite because it appears the same from all angles
    if (glow_amnt > 0) {
        var spriteMaterial = new THREE.SpriteMaterial(
            {
                map: new THREE.TextureLoader().load(glow),
                color: color, transparent: true, blending: THREE.AdditiveBlending
        });
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(glow_amnt, glow_amnt, glow_amnt);
        mesh.add(sprite); // this centers the glow at the mesh
    }

    return mesh
}

/**
 * Creates a selector mesh with the specified properties.
 *
 * @param {number} [color=0xfffff] - The color of the mesh.
 * @param {number} [radius=0.2] - The radius of the mesh.
 * @param {number} [width=0.02] - The width of the mesh.
 * @param {number} [segments=32] - The number of segments in the mesh.
 * @returns {THREE.Mesh} The created selector mesh.
 */
export function createSelectorMesh(color=0xfffff, radius=0.2, width=0.02, segments=32) {
    const geometry = new THREE.RingGeometry(radius, radius + width, segments);
    const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });

    const selector = new THREE.Mesh(geometry, material);
    selector.position.set(0, 0, 0);
    selector.rotation.set(Math.PI / 2, 0, 0);
    return selector
}

/**
 * Performs a multi-raycast operation to find intersections between a set of objects and multiple rays
 * originating from a given mouse position.
 *
 * @param {Object} mouse - The mouse position object with `x` and `y` coordinates.
 * @param {Object} camera - The camera object used for raycasting.
 * @param {Array} objects - An array of objects to perform raycasting against.
 * @param {Object} raycaster - The raycaster object used for raycasting.
 * @param {number} [spread=0.001] - The spread factor for generating multiple rays.
 * @param {number} [steps=10] - The number of steps in each direction to generate rays.
 * @returns {Array} An array of intersection results.
 */
export function multiRaycast(mouse, camera, objects, raycaster, spread = 0.001, steps = 3) {
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