import * as THREE from 'three';

export class Handle {
    constructor(camera, controls) {
        this.camera = camera
        this.controls = controls
        this.reset()
        this.isRetreating = false
        this.hasReachedTarget = false
    }

    update(alpha_controls = 0.03, alpha_camera = 0.01, controls_cutoff = 1e-3, camera_cutoff = 10) {
        const controls_diff = this.controls.target.distanceTo(this.controls_target)
        if (controls_diff > controls_cutoff) {
            this.controls.target.lerp(this.controls_target, alpha_controls)
        } else {
            this.controls.target = this.controls_target
        }

        if (this.hasReachedTarget)
            return

        const camera_target = this.isRetreating ? new THREE.Vector3(0, 20, 30) : this.camera_target
        const camera_diff = this.camera.position.distanceTo(camera_target)
        if (camera_diff > camera_cutoff) {
            this.camera.position.lerp(camera_target, alpha_camera);
        } else {
            this.hasReachedTarget = this.camera.position.distanceTo(this.camera_target) <= camera_cutoff
            this.isRetreating = false
        }
    }

    target(controls_target, camera_target=false) {
        this.isRetreating = true
        this.hasReachedTarget = false
        this.controls_target = controls_target.position.clone()
        this.camera_target = camera_target ? camera_target.position.clone() : controls_target.position.clone()
    }

    reset() {
        this.controls_target = new THREE.Vector3(0, 0, 0)
        this.camera_target = new THREE.Vector3(0, 20, 30)
    }
}