import * as THREE from 'three';
import { filterBelow, logger, SceneCamera } from '@tgdf';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';

import { CameraMoveToOptions } from './types';
import { CAMERA_POSITION_OFFSET } from '../../constants';

const DEFAULT_CAMERA_LERP = 0.025;
const SHAKE_DAMPING_FACTOR = 0.97;
const FRAMERATE_DAMPING_FACTOR = 160; // 0.97 / 0.006s @144Hz
const SHAKE_FREQUENCY = 10;

export type OrtographicCameraOptions = {
  options: {
    left?: number | undefined;
    right?: number | undefined;
    top?: number | undefined;
    bottom?: number | undefined;
    near?: number | undefined;
    far?: number | undefined;
  };
  zoom?: {
    min: number;
    max: number;
  };
};

/**
 * Ortographic Camera class.
 * Extends THREE.OrthographicCamera.
 * @param {OrtographicCameraOptions} options - The options for the ortographic camera.
 */
export class OrtographicCamera extends THREE.OrthographicCamera implements SceneCamera {
  private _zoom: { min: number; max: number } = { min: 0.1, max: 1 };
  private _pivotPoint: THREE.Vector3 = new THREE.Vector3();
  private _followTarget: THREE.Object3D | null = null;
  private _basePosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  private _noise = new ImprovedNoise();
  private _shakeOffset: THREE.Vector3 = new THREE.Vector3();
  private _shakeIntensity: number = 0;
  private _shakeTime: number = 0;

  constructor({ options = {}, zoom }: OrtographicCameraOptions) {
    super(
      options.left ?? -1,
      options.right ?? 1,
      options.top ?? 1,
      options.bottom ?? -1,
      options.near ?? 0.1,
      options.far ?? 1000
    );

    if (zoom) {
      this._zoom = zoom;
    }

    this.rotation.order = 'YXZ';
    this.up.set(0, 1, 0);
  }

  public get pivotPoint(): THREE.Vector3 {
    // If no custom pivot point set, return camera position (tracks camera)
    return this._pivotPoint ?? this.position;
  }

  public set pivotPoint(point: THREE.Vector3) {
    // Create a new Vector3 to avoid reference issues
    if (!this._pivotPoint) {
      this._pivotPoint = new THREE.Vector3();
    }
    this._pivotPoint.copy(point);
  }

  public addShake(intensity: number): void {
    if (intensity <= 0) {
      logger({
        message: `Camera shake intensity must be greater than 0. Received: ${intensity}`,
        type: 'warn',
      });
      return;
    }
    this._shakeIntensity += intensity;
  }

  public setZoomMax(max: number): void {
    this._zoom.max = max;
  }

  public setZoomMin(min: number): void {
    this._zoom.min = min;
  }

  public setZoom(zoom: number): void {
    this.zoom = THREE.MathUtils.clamp(zoom, this._zoom.min, this._zoom.max);
    this.updateProjectionMatrix();
  }

  public moveTo(position: THREE.Vector3, options?: CameraMoveToOptions): void {
    const targetPosition = position.clone();

    if (options?.offset) {
      targetPosition.add(options.offset);
    }

    if (options?.lerp) {
      this._basePosition.lerp(targetPosition, options.lerp);
    } else {
      this._basePosition.copy(targetPosition);
    }
  }

  public follow(target: THREE.Object3D): void {
    this._followTarget = target;
    // Initialize pivot point to target's position when starting to follow
    this._pivotPoint.copy(target.position);
  }

  public stopFollowing(): void {
    this._followTarget = null;
    this._pivotPoint = new THREE.Vector3();
  }

  public update(deltaTime: number): void {
    this._followCameraTarget();
    this._applyCameraShake(deltaTime);

    this.position.copy(this._basePosition).add(this._shakeOffset);
  }

  private _followCameraTarget(): void {
    if (!this._followTarget) return;

    // Keep camera positioned above the player - create new Vector3 to avoid reference issues
    const targetPosition = new THREE.Vector3(
      this._followTarget.position.x,
      this._followTarget.position.y,
      this._followTarget.position.z
    );

    // Update pivot point to follow the player
    this._pivotPoint.copy(targetPosition);

    // Rotate offset by camera's Y rotation around the pivot point
    const rotatedOffset = CAMERA_POSITION_OFFSET.clone().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.rotation.y
    );

    // Move camera to the rotated offset position
    this.moveTo(targetPosition, {
      offset: rotatedOffset,
      lerp: DEFAULT_CAMERA_LERP,
    });
  }

  private _applyCameraShake(deltaTime: number): void {
    if (this._shakeIntensity <= 0) {
      this._shakeOffset.set(0, 0, 0);
      this._shakeTime = 0;
      return;
    }

    this._shakeTime += deltaTime;

    const shake = this._shakeIntensity;
    const nx = this._noise.noise(this._shakeTime * SHAKE_FREQUENCY, 0, 0);
    const ny = this._noise.noise(this._shakeTime * SHAKE_FREQUENCY, 100, 0);

    this._shakeOffset.set(nx * shake, ny * shake, 0);

    const framerateAdjustedShakeDampingFactor = Math.min(
      SHAKE_DAMPING_FACTOR / (deltaTime * FRAMERATE_DAMPING_FACTOR),
      1
    );

    // Dampen the shake intensity over time
    this._shakeIntensity = filterBelow(
      this._shakeIntensity * framerateAdjustedShakeDampingFactor,
      0.01
    );
  }
}
