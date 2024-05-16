import * as THREE from 'three';

let isCameraMoving = false
let target = new THREE.Vector3(0, 0, 0)
export function updateCamera(camera, controls, lerp_alpha=0.01, pos_cutoff=5) {
    if (!(isCameraMoving && target)) return;
    camera.position.lerp(target, lerp_alpha);

    const pos_diff = camera.position.distanceTo(target)
    if (pos_diff < pos_cutoff) {
        isCameraMoving = false;
    }
}

export function setTarget(t, camera, controls) {
    isCameraMoving = true
    target = t.position.clone()

    controls.target = target
    controls.update()
}

export function reset() {
    isCameraMoving = false
    target = new THREE.Vector3(0, 0, 0)
}