import * as THREE from 'three';
import { logger } from '@tgdf';
import { TestScene } from 'src/renderer/scenes/test/TestScene';

import { MovableGameObject } from './MovableGameObject';
import { WSADControls } from '../gameObjectComponents/controls/WSADControls';

export class ControlledBox extends MovableGameObject {
  constructor(scene: TestScene) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);

    super(scene, {
      speed: 3,
      mass: 1,
      friction: 1,
    });

    this.add(mesh);

    if (!scene.mouseInput || !scene.keyboardInput) {
      logger({
        message:
          'Mouse or keyboard input not available in scene. WSADControls component will not function.',
        type: 'error',
      });
      return;
    }

    this.addComponent(
      'WSADControls',
      new WSADControls({
        gameObject: this,
        camera: scene.camera,
        keyboardInput: scene.keyboardInput,
        mouseInput: scene.mouseInput,
      })
    );
  }
}
