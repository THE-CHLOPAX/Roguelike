import * as THREE from 'three';
import { compareFloats, filterBelow } from '@tgdf';

export type CameraInertiaOptions = {
  maxAcceleration?: THREE.Vector3;
  accelerationRate?: number;
  decelerationDamping?: number;
};

/**
 * Camera Inertia class to handle acceleration and deceleration of camera movement.
 * @param {THREE.Camera} camera - The camera to apply inertia to.
 * @param {CameraInertiaOptions} options - The inertia options.
 */
export class CameraInertia {
  private _camera: THREE.Camera;

  private _direction: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private _acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private _maxAcceleration: THREE.Vector3 = new THREE.Vector3(15, 15, 15);
  private _accelerationRate: number = 0.8;
  private _decelerationRate: number = 0.03;

  constructor(camera: THREE.Camera, options: CameraInertiaOptions = {}) {
    if (options.maxAcceleration) this._maxAcceleration.copy(options.maxAcceleration);
    if (options.accelerationRate !== undefined) this._accelerationRate = options.accelerationRate;
    if (options.decelerationDamping !== undefined)
      this._decelerationRate = options.decelerationDamping;

    this._camera = camera;
    this._camera.rotation.order = 'YXZ';
    this._camera.up.set(0, 1, 0);
  }

  public set maxAcceleration(maxAcceleration: THREE.Vector3) {
    this._maxAcceleration.copy(maxAcceleration);
  }

  public get maxAcceleration(): THREE.Vector3 {
    return this._maxAcceleration;
  }

  public set accelerationRate(damping: number) {
    this._accelerationRate = damping;
  }

  public get accelerationRate(): number {
    return this._accelerationRate;
  }

  public set decelerationDamping(damping: number) {
    this._decelerationRate = damping;
  }

  public get decelerationDamping(): number {
    return this._decelerationRate;
  }

  public get direction(): THREE.Vector3 {
    return this._direction;
  }

  public set direction(direction: THREE.Vector3) {
    this._direction.copy(direction);
  }

  public update(value: { deltaTime: number }): void {
    this._applyAcceleration(this._direction);

    // For PerspectiveCamera, we can use built-in translation methods
    if (this._camera instanceof THREE.PerspectiveCamera) {
      this._camera.translateX(this._acceleration.x * value.deltaTime);
      this._camera.translateY(this._acceleration.y * value.deltaTime);
      this._camera.translateZ(this._acceleration.z * value.deltaTime);
    }
    // For OrthographicCamera, we need to manually apply rotation to movement
    else if (this._camera instanceof THREE.OrthographicCamera) {
      const movement = new THREE.Vector3(
        this._acceleration.x * value.deltaTime,
        this._acceleration.y * value.deltaTime,
        this._acceleration.z * value.deltaTime
      );
      // Rotate movement vector by camera's Y rotation
      movement.applyAxisAngle(new THREE.Vector3(0, 1, 0), this._camera.rotation.y);
      this._camera.position.x += movement.x;
      this._camera.position.y += movement.y;
      this._camera.position.z += movement.z;
    }
  }

  private _applyAcceleration(direction: THREE.Vector3): void {
    for (const axis of ['x', 'y', 'z'] as const) {
      if (
        direction[axis] < 0 &&
        compareFloats(this._acceleration[axis], 'greater-than', -this._maxAcceleration[axis])
      ) {
        const accelerationRate = this._accelerationRate <= 0 ? 1 : this._accelerationRate;
        this._acceleration[axis] -= accelerationRate;
      }
      if (
        direction[axis] > 0 &&
        compareFloats(this._acceleration[axis], 'less-than', this._maxAcceleration[axis])
      ) {
        const accelerationRate = this._accelerationRate <= 0 ? 1 : this._accelerationRate;
        this._acceleration[axis] += accelerationRate;
      }
      // Decelerate when no input is given in this axis
      if (direction[axis] === 0) {
        const decelerationDamping = this._decelerationRate <= 0 ? 1 : 1 + this._decelerationRate;
        this._acceleration[axis] = filterBelow(
          this._acceleration[axis] / decelerationDamping,
          1e-2
        );
      }
    }
  }
}
