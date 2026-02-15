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
  private _pivotPoint: THREE.Vector3 = this.position;

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
    return this._pivotPoint;
  }

  public set pivotPoint(point: THREE.Vector3) {
    this._pivotPoint = point;
  }

  public moveTo(position: THREE.Vector3, options?: CameraMoveToOptions): void {
    if (options?.offset) {
      position.add(options.offset);
    }

    if (options?.lerp) {
      this.position.lerp(position, options.lerp);
    } else {
      this.position.copy(position);
    }
  }
}
