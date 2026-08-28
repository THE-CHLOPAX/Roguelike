import * as THREE from 'three';
import { Scene, useAssetStore } from '@tgdf';

import { LevelSceneData } from '../../types';
import { CHECKERBOARD_TEXTURE } from '../../constants';
import { pixelateTexture } from '../../utils/pixelateTexture';
import { RigidFloorObject } from '../gameObjects/RigidFloorObject';

const PLANE_WIDTH = 30;
const PLANE_HEIGHT = 30;
const CHECKERBOARD_REPEAT = 3;

export async function buildTestScene(scene: Scene): Promise<LevelSceneData> {
  const checkerboardTexture = pixelateTexture(
    await useAssetStore.getState().loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png')
  );
  checkerboardTexture?.repeat.set(CHECKERBOARD_REPEAT, CHECKERBOARD_REPEAT);

  const floorMaterial = new THREE.MeshPhongMaterial({ map: checkerboardTexture });
  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT),
    floorMaterial
  );
  floorMesh.rotation.x = -Math.PI / 2;
  scene.add(floorMesh);

  const rigidFloorObject = new RigidFloorObject(scene, {
    position: new THREE.Vector3(0, 0, 0),
    size: new THREE.Vector3(PLANE_WIDTH, 0.1, PLANE_HEIGHT),
  });
  scene.add(rigidFloorObject);

  return { floorMesh };
}
