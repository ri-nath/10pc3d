import * as THREE from 'three';

let isCameraMoving = false
let target = null

export function updateCamera(camera, controls, lerp_alpha=0.05, pos_cutoff=4) {
    if (!(isCameraMoving && target)) return;
    camera.position.lerp(target, 0.01);
    controls.update();
    const pos_diff = camera.position.distanceTo(target)
    if (pos_diff < pos_cutoff) {
        isCameraMoving = false;
    }
}

export function setTarget(t, camera, controls) {
    isCameraMoving = true
    target = t.position

    controls.target = t.position;
    controls.update()
}