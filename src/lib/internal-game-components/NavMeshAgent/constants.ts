import * as THREE from 'three';

export const NAV_MESH_AGENT_MESSAGES = {
  FAILED_TO_COMPUTE_PATH_TO_TARGET: (start: THREE.Vector3, target: THREE.Vector3, error: string) =>
    `[NavMeshAgent] Failed to compute path from 
  ${start.toString()} to ${target.toString()} (${error})`,
};
