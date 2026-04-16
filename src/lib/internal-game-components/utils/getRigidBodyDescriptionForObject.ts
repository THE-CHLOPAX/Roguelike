import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

import { RigidBodyOptions } from '../RigidBody';

export function getRigidBodyDescriptionForObject(
  object: THREE.Object3D,
  options: RigidBodyOptions
): RAPIER.RigidBodyDesc {
  let bodyDesc: RAPIER.RigidBodyDesc;

  switch (options.type) {
    case 'static':
      bodyDesc = RAPIER.RigidBodyDesc.fixed();
      break;
    case 'kinematic':
      bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
      break;
    case 'dynamic':
    default:
      bodyDesc = RAPIER.RigidBodyDesc.dynamic();
      break;
  }

  // Set initial position and rotation
  const pos = object.position;
  const quat = object.quaternion;

  bodyDesc.setTranslation(pos.x, pos.y, pos.z);
  bodyDesc.setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w });

  // Set damping
  if (options.linearDamping) {
    bodyDesc.setLinearDamping(options.linearDamping);
  }

  if (options.angularDamping) {
    bodyDesc.setAngularDamping(options.angularDamping);
  }

  return bodyDesc;
}
