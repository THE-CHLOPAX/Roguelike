import * as THREE from 'three';

import { CameraMoveToOptions } from './types';

export type OrtographicCameraOptions = {
  options: {
    left?: number | undefined;
    right?: number | undefined;
    top?: number | undefined;
    bottom?: number | undefined;
    near?: number | undefined;
    far?: number | undefined;
  };
};

/**
 * Ortographic Camera class.
 * Extends THREE.OrthographicCamera.
 * @param {OrtographicCameraOptions} options - The options for the ortographic camera.
 */
export class OrtographicCamera extends THREE.OrthographicCamera {
  private _pivotPoint: THREE.Vector3 | null = null;

  constructor({ options = {} }: OrtographicCameraOptions) {
    super(
      options.left ?? -1,
      options.right ?? 1,
      options.top ?? 1,
      options.bottom ?? -1,
      options.near ?? 0.1,
      options.far ?? 1000
    );

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

  public moveTo(position: THREE.Vector3, options?: CameraMoveToOptions): void {
    const targetPosition = position.clone();

    if (options?.offset) {
      targetPosition.add(options.offset);
    }

    if (options?.lerp) {
      this.position.lerp(targetPosition, options.lerp);
    } else {
      this.position.copy(targetPosition);
    }
  }
}
