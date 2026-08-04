import * as THREE from 'three';
import { RigidBodyOptions } from '@tgdf';

import { ModelRecord } from './types';

export const CAMERA_POSITION_OFFSET = new THREE.Vector3(0, 8, 11.5);

export const FLOOR_OBJECT_MESH_NAME = 'test-floor-plane-mesh';

export const CHECKERBOARD_TEXTURE = 'checkerboard-texture';

export const EXPLOSION_SPRITESHEET_TEXTURE = 'explosion-spritesheet-texture';
export const MAIN_CROWD_ID = 'main-crowd';

// NavMesh configuration
export const NAVMESH_AGENT_RADIUS = 0.6; // Agent radius in world units
export const NAVMESH_AGENT_HEIGHT = 2.0;

export const DEFAULT_RIGID_BODY_OPTIONS: RigidBodyOptions = {
  mass: 0.1,
  friction: 0,
  linearDamping: 0,
  lockRotation: true,
  colliderShape: 'cylinder',
  enableCollisionDetection: true,
};

// Model records
export const MODELS: Record<string, ModelRecord> = {
  SKELETON: {
    id: 'model-skeleton',
    path: './assets/models/skeleton.glb',
    nameExtractor: 'Armature',
  },
  MONK: {
    id: 'model-monk',
    path: './assets/models/monk.glb',
    nameExtractor: 'Armature',
  },
  KNIGHT: {
    id: 'model-knight',
    path: './assets/models/knight.glb',
    nameExtractor: 'Knight',
  },
};
