import * as THREE from 'three';
import { ShapeType } from '@dimforge/rapier3d-compat';
import { GameObject, logger, RigidBody, Scene } from '@tgdf';
import { ControlsTestScene } from 'src/renderer/scenes/ControlsTestScene';

import { WSADControls } from '../gameObjectComponents/WSADControls';

export class ControlledBox extends GameObject {
  constructor(scene: ControlsTestScene) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);

    super({
      scene,
      object: mesh,
    });

    const rigidBodyComponent = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        mass: 1,
        colliderShape: ShapeType.Cuboid,
        type: 'dynamic',
        friction: 1,
      })
    );

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
        rigidBody: rigidBodyComponent,
        keyboardInput: scene.keyboardInput,
      })
    );
  }
}
