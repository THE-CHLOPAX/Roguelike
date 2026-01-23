import RAPIER from '@dimforge/rapier3d-compat';

export type PhysicsManagerEventsMap = {
    'physicsinitialized': void;
}

export type PhysicsCollisionCallback = (handle1: RAPIER.RigidBodyHandle, handle2: RAPIER.RigidBodyHandle, started: boolean) => void;
