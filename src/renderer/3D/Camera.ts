import * as THREE from 'three';
import { KeyboardInput, MouseInput } from '@tgdf';

export type CameraDependencies = {
  options: {
    fov: number;
    aspect: number;
    near: number;
    far: number;
  };
  keyboardInput?: KeyboardInput;
  mouseInput?: MouseInput;
};

export class Camera extends THREE.PerspectiveCamera {
  private _keyboardInput: KeyboardInput;
  private _mouseInput: MouseInput;

  constructor({ options, keyboardInput, mouseInput }: CameraDependencies) {
    super(options.fov, options.aspect, options.near, options.far);

    console.log(keyboardInput, mouseInput);
    if (!keyboardInput || !mouseInput) {
      throw new Error('Camera requires keyboardInput and mouseInput dependencies.');
    }

    this._keyboardInput = keyboardInput;
    this._mouseInput = mouseInput;
  }
}
