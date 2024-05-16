import * as THREE from 'three';

let isCameraMoving = false
let isCameraRetreating = false
let target = new THREE.Vector3(0, 0, 0)
export function updateCamera(camera, controls, lerp_alpha=0.01, pos_cutoff=10) {
    if (!(isCameraMoving && target)) return;

    let current_target = isCameraRetreating ? new THREE.Vector3(0, 20, 30) : target
    camera.position.lerp(current_target, lerp_alpha);

    const pos_diff = camera.position.distanceTo(current_target)
    if (pos_diff < pos_cutoff) {
        if (isCameraRetreating) {
            isCameraRetreating = false
            controls.target = target
            controls.update()

        } else {
            isCameraMoving = false;
        }
    }
}

export function setTarget(t, camera, controls) {
    isCameraMoving = true
    isCameraRetreating = true
    target = t.position.clone()
}

export function reset() {
    isCameraMoving = false
    target = new THREE.Vector3(0, 0, 0)
}