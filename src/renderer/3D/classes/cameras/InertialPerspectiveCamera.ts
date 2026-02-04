import { Scene } from '@tgdf';
import * as THREE from 'three';

import { CameraInertia, CameraInertiaOptions } from './CameraInertia';

export type InertialPerspectiveCameraOptions = {
  options: {
    fov?: number | undefined;
    aspect?: number | undefined;
    near?: number | undefined;
    far?: number | undefined;
  };
  inertiaOptions?: CameraInertiaOptions;
  scene: Scene;
};

/**
 * Inertial Perspective Camera with acceleration and deceleration behavior.
 * Extends THREE.PerspectiveCamera.
 * @param {CameraDependencies} options - The options for the perspective camera.
 * @param {Scene} scene - The scene the camera belongs to.
 */
export class InertialPerspectiveCamera extends THREE.PerspectiveCamera {
  private _cameraIntertia: CameraInertia;

  constructor({ options = {}, inertiaOptions = {}, scene }: InertialPerspectiveCameraOptions) {
    super(options.fov ?? 75, options.aspect ?? 1, options.near ?? 0.1, options.far ?? 1000);

    this._cameraIntertia = new CameraInertia(this, { ...inertiaOptions });

    scene.events.on('update', this._cameraIntertia.update.bind(this._cameraIntertia));
  }

  protected get direction(): THREE.Vector3 {
    return this._cameraIntertia.direction;
  }

  protected set direction(direction: THREE.Vector3) {
    this._cameraIntertia.direction = direction;
  }
}
