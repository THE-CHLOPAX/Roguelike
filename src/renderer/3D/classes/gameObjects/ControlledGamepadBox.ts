import * as THREE from 'three';
import { GamepadInput } from '@tgdf';
import { ControlsTestScene } from 'src/renderer/scenes/ControlsTestScene';

import { MovableGameObject } from './MovableGameObject';
import { GamepadControls } from '../gameObjectComponents/GamepadControls';

export class ControlledGamepadBox extends MovableGameObject {
  constructor(scene: ControlsTestScene, gamepadInput: GamepadInput) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);

    super(scene, mesh, {
      speed: 3,
      mass: 1,
      friction: 1,
    });

    this.addComponent(
      'GamepadControls',
      new GamepadControls({
        gameObject: this,
        camera: scene.camera,
        gamepadInput: gamepadInput,
      })
    );
  }
}
