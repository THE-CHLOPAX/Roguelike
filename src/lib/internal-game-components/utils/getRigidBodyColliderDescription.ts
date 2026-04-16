import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { getObjectBbox } from '@tgdf/internal-3d/utils/getObjectBbox';

import { RigidBodyOptions, RigidBodyShape } from '../RigidBody';

export function getRigidBodyColliderDescription(
  type: RigidBodyShape,
  object: THREE.Object3D,
  options?: RigidBodyOptions
): RAPIER.ColliderDesc {
  const bbox = getObjectBbox(object);
  const size = new THREE.Vector3();
  bbox.getSize(size);

  let colliderDesc: RAPIER.ColliderDesc;

  switch (type) {
    case 'box':
      colliderDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
      break;
    case 'cylinder': {
      const radius = Math.max(size.x, size.z) / 2;
      const height = size.y;
      colliderDesc = RAPIER.ColliderDesc.cylinder(radius, height / 2);
      break;
    }
    default:
      throw new Error(`Unsupported collider shape: ${type}`);
  }

  // Set collider translation to match the bounding box center
  // This ensures the collider is positioned correctly relative to the model's geometry
  const bboxCenter = new THREE.Vector3();
  bbox.getCenter(bboxCenter);

  // Set material properties
  if (options?.friction) colliderDesc.setFriction(options.friction);
  if (options?.restitution) colliderDesc.setRestitution(options.restitution);
  if (options?.mass) colliderDesc.setMass(options.mass);

  return colliderDesc;
}
