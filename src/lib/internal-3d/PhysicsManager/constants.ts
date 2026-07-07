export const PHYSICS_MANAGER_MESSAGES = {
  WORLD_NOT_INITIALIZED: '[PhysicsManager] Physics world is not initialized for this scene',
  BODIES_MAP_NOT_INITIALIZED_FOR_SCENE:
    '[Physics Manager] Physics bodies map is not initialized for this scene',
  BODIES_MAP_NOT_INITIALIZED: '[Physics Manager] Physics bodies map is not initialized',
  INVALID_RIGID_BODY_HANDLE:
    '[Physics Manager] Cannot add body to PhysicsManager: RigidBody does not have a valid handle',
  BODY_NOT_FOUND: '[Physics Manager] Unable to remove body - body not found for the given object',
  WORLD_OR_EVENT_QUEUE_NOT_INITIALIZED:
    '[Physics Manager] Physics world or event queue is not initialized',
} as const;
