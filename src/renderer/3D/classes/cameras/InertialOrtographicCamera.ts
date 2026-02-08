import { Scene } from '@tgdf';
import * as THREE from 'three';

import { CameraInertia, CameraInertiaOptions } from './CameraInertia';

export type InertialOrtographicCameraOptions = {
  options: {
    left?: number | undefined;
    right?: number | undefined;
    top?: number | undefined;
    bottom?: number | undefined;
    near?: number | undefined;
    far?: number | undefined;
  };
  inertiaOptions?: CameraInertiaOptions;
  scene: Scene;
};

/**
 * Inertial Ortographic Camera with acceleration and deceleration behavior.
 * Extends THREE.OrthographicCamera.
 * @param {InertialOrtographicCameraOptions} options - The options for the ortographic camera.
 * @param {Scene} scene - The scene the camera belongs to.
 */
export class InertialOrtographicCamera extends THREE.OrthographicCamera {
  private _cameraInertia: CameraInertia;

  constructor({ options = {}, inertiaOptions = {}, scene }: InertialOrtographicCameraOptions) {
    super(
      options.left ?? -1,
      options.right ?? 1,
      options.top ?? 1,
      options.bottom ?? -1,
      options.near ?? 0.1,
      options.far ?? 1000
    );

    this._cameraInertia = new CameraInertia(this, { ...inertiaOptions });

    scene.events.on('update', this._cameraInertia.update.bind(this._cameraInertia));
  }

  protected get direction(): THREE.Vector3 {
    return this._cameraInertia.direction;
  }

  protected set direction(direction: THREE.Vector3) {
    this._cameraInertia.direction = direction;
  }
}
