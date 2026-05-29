import * as THREE from 'three';

import { ModelRecord } from './types';

export const CAMERA_POSITION_OFFSET = new THREE.Vector3(0, 8, 11.5);

export const FLOOR_OBJECT_MESH_NAME = 'test-floor-plane-mesh';

export const CHECKERBOARD_TEXTURE = 'checkerboard-texture';
export const MAIN_ENEMY_CROWD_ID = 'main-crowd';

// NavMesh configuration
export const NAVMESH_AGENT_RADIUS = 0.6; // Agent radius in world units
export const NAVMESH_AGENT_HEIGHT = 2.0;

// Model records
export const MODELS: Record<string, ModelRecord> = {
  SKELETON: {
    id: 'model-skeleton',
    path: './assets/models/skeleton.glb',
    nameExtractor: 'Skeleton',
  },
  MONK: {
    id: 'model-monk',
    path: './assets/models/monk.glb',
    nameExtractor: 'Monk',
  },
  KNIGHT: {
    id: 'model-knight',
    path: './assets/models/knight.glb',
    nameExtractor: 'Knight',
  },
};
