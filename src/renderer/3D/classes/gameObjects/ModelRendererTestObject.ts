import * as THREE from 'three';
import { GameObject, Scene } from '@tgdf';

export class ModelRendererTestObject extends GameObject {
  constructor(scene: Scene) {
    super({ scene });

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const mesh = new THREE.Mesh(geometry, material);

    this.add(mesh);
  }
}
