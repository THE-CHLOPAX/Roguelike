import path from 'path/win32';
import * as THREE from 'three';

import { ModelRecord } from './types';

export const CAMERA_POSITION_OFFSET = new THREE.Vector3(0, 8, 11.5);

// Model records
export const MODELS: Record<string, ModelRecord> = {
  SKELETON: {
    id: 'model-skeleton',
    path: path.join('./assets/models/skeleton.glb'),
    nameExtractor: 'Skeleton',
  },
  MONK: {
    id: 'model-monk',
    path: path.join('./assets/models/monk.glb'),
    nameExtractor: 'Monk',
  },
  KNIGHT: {
    id: 'model-knight',
    path: path.join('./assets/models/knight.glb'),
    nameExtractor: 'Knight',
  },
};
