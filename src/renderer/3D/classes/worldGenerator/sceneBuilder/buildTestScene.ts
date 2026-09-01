import * as THREE from 'three';
import { Scene, useAssetStore } from '@tgdf';

import { CHECKERBOARD_TEXTURE } from 'renderer/3D/constants';
import { pixelateTexture } from 'renderer/3D/utils/pixelateTexture';

import { RigidStaticObject } from '../../gameObjects/RigidStaticObject';

const PLANE_WIDTH = 30;
const PLANE_HEIGHT = 30;
const CHECKERBOARD_REPEAT = 3;

export async function buildTestScene(scene: Scene): Promise<void> {
  const floorGroup = new THREE.Group();

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
  floorGroup.add(floorMesh);
  scene.add(floorGroup);

  const rigidFloorObject = new RigidStaticObject(scene, {
    position: new THREE.Vector3(0, 0, 0),
    size: new THREE.Vector3(PLANE_WIDTH, 0.1, PLANE_HEIGHT),
  });
  scene.add(rigidFloorObject);

  await scene.initializeNavMeshManager(floorGroup);

  return Promise.resolve();
}
