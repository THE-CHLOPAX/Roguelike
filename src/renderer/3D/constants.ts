import * as THREE from 'three';
import { RigidBodyOptions } from '@tgdf';

import { ModelRecord } from './types';

// Default camera position relative to its pivot point, e.g. for an isometric-style view.
export const CAMERA_POSITION_OFFSET = new THREE.Vector3(6, 6, 6);

export const FLOOR_OBJECT_MESH_NAME = 'test-floor-plane-mesh';

export const CHECKERBOARD_TEXTURE = 'checkerboard-texture';

export const EXPLOSION_SPRITESHEET_TEXTURE = 'explosion-spritesheet-texture';
export const ARCANE_CIRCLE_TEXTURE = 'arcane-circle-texture';
export const MAIN_CROWD_ID = 'main-crowd';

// Material parameters that change which shader program three.js compiles
type StructuralMaterialParameter =
  | 'map'
  | 'aoMap'
  | 'envMap'
  | 'bumpMap'
  | 'alphaMap'
  | 'lightMap'
  | 'normalMap'
  | 'blending'
  | 'alphaTest'
  | 'emissiveMap'
  | 'transparent'
  | 'roughnessMap'
  | 'metalnessMap'
  | 'alphaToCoverage'
  | 'displacementMap';

/**
 * Adding a new variant? Warm it in ShadersManager's
 * _createShaderWarmupGroup too, or it'll compile mid-gameplay on first use
 * instead of at load — that switch is exhaustive over keyof MATERIALS, so
 * forgetting is a build error there, not a silent gap.
 */
export const MATERIALS = {
  // Untextured glowing surface
  STANDARD_EMISSIVE: (
    options: Omit<THREE.MeshStandardMaterialParameters, StructuralMaterialParameter> = {}
  ): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({
      name: 'MATERIALS.STANDARD_EMISSIVE',
      emissive: 0xffffff,
      transparent: true,
      ...options,
    }),

  // Textured glowing surface — the texture doubles as the emissive map
  STANDARD_EMISSIVE_WITH_MAP: ({
    map,
    ...options
  }: Omit<THREE.MeshStandardMaterialParameters, StructuralMaterialParameter> & {
    map: THREE.Texture;
  }): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({
      name: 'MATERIALS.STANDARD_EMISSIVE_WITH_MAP',
      map,
      emissiveMap: map,
      emissive: 0xffffff,
      transparent: true,
      ...options,
    }),

  // Alpha-cutout billboard sprite
  SPRITE_WITH_ALPHA: (
    options: Omit<THREE.SpriteMaterialParameters, StructuralMaterialParameter> & {
      map: THREE.Texture;
    }
  ): THREE.SpriteMaterial =>
    new THREE.SpriteMaterial({
      name: 'MATERIALS.SPRITE_WITH_ALPHA',
      transparent: true,
      alphaTest: 0.5,
      ...options,
    }),
};

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
  DUNGEON_DOOR: {
    id: 'model_dungeon_door',
    path: './assets/models/model_dungeon_door.fbx',
  },
  DUNGEON_DOOR_FRAME: {
    id: 'model_dungeon_door_frame',
    path: './assets/models/model_dungeon_door_frame.fbx',
  },
  DUNGEON_PILLAR: {
    id: 'model_dungeon_pillar',
    path: './assets/models/model_dungeon_pillar.fbx',
  },
  DUNGEON_TORCH_WALL: {
    id: 'model_dungeon_torch_wall',
    path: './assets/models/model_dungeon_torch_wall.fbx',
  },
  DUNGEON_WALL_BRICK_TALL: {
    id: 'model_dungeon_wall_brick_tall',
    path: './assets/models/model_dungeon_wall_brick_tall.fbx',
  },
};
