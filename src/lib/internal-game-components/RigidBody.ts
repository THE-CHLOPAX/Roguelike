import * as THREE from 'three';
import { logger, GameObject } from '@tgdf';
import RAPIER from '@dimforge/rapier3d-compat';

import { Emitter } from '../internal-3d/Emitter';
import { GameObjectComponent } from './GameObjectComponent';
import { SceneEventsMap } from '../internal-3d/types/scene';
import { GameObjectEventMap } from '../internal-3d/types/gameObjects';
import { PhysicsCollisionCallback } from '../internal-3d/types/physics';

export type RigidBodyEventsMap = {
  'colliderready': void;
}

export type RigidBodyType = 'dynamic' | 'static' | 'kinematic';
export type RigidBodyOptions = {
  type?: RigidBodyType;
  mass?: number;
  friction?: number;
  restitution?: number; // Bounciness (0 = no bounce, 1 = perfect bounce)
  linearDamping?: number; // Air resistance
  angularDamping?: number; // Rotation resistance
  colliderShape?: RAPIER.ShapeType;
  enableCollisionDetection?: boolean;
}

export class RigidBody<T extends GameObjectEventMap = GameObjectEventMap, K extends SceneEventsMap = SceneEventsMap> extends GameObjectComponent<RigidBodyOptions, K, T> {

  public static BodyType = RAPIER.RigidBodyType;
  public static ShapeType = RAPIER.ShapeType;
  public static ActiveEvents = RAPIER.ActiveEvents;

  private _events: Emitter<RigidBodyEventsMap> = new Emitter<RigidBodyEventsMap>();
  private _body?: RAPIER.RigidBody;
  private _collider?: RAPIER.Collider;
  private _colliderDebugMesh?: THREE.Mesh;

  constructor(gameObject: GameObject<T, K>, options: RigidBodyOptions = {}) {
    super(gameObject, options);

    // Override options with defaults
    this.options = {
      type: 'dynamic',
      mass: 10,
      friction: 0,
      restitution: 0.3,
      linearDamping: 0.5,
      angularDamping: 0.1,
      ...options,
    };

    const scene = this.gameObject.scene;

    if (!scene) {
      logger({ message: 'RigidBody: GameObject is not part of a scene', type: 'error' });
      return;
    }

    if (!scene.physics) {
      logger({ message: 'RigidBody: Physics world not initialized', type: 'error' });
      return;
    }

    if (scene.physics.isInitialized) {
      this._createPhysicsBody();
    } else {
      scene.physics.events.once('physicsinitialized', () => {
        this._createPhysicsBody();
      });
    }
  }

  public get collider(): RAPIER.Collider | undefined {
    return this._collider;
  }

  public get body(): RAPIER.RigidBody | undefined {
    return this._body;
  }

  public get events(): Emitter<RigidBodyEventsMap> {
    return this._events;
  }

  public applyForce(force: THREE.Vector3): void {
    if (this._body) {
      this._body.addForce({ x: force.x, y: force.y, z: force.z }, true);
    }
  }

  public applyImpulse(impulse: THREE.Vector3): void {
    if (this._body) {
      this._body.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
    }
  }

  public setVelocity(velocity: THREE.Vector3): void {
    if (this._body) {
      this._body.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
    }
  }

  public getVelocity(): THREE.Vector3 {
    if (this._body) {
      const vel = this._body.linvel();
      return new THREE.Vector3(vel.x, vel.y, vel.z);
    }
    return new THREE.Vector3();
  }

  public destroy(): void {
    const scene = this.gameObject.scene;
    if (scene?.physics) {
      scene.physics.removeBody(this.gameObject);
    }

    // Clear references to prevent use of destroyed physics objects
    this._body = undefined;
    this._collider = undefined;

    // Remove debug mesh if it exists
    if (this._colliderDebugMesh) {
      this._colliderDebugMesh.removeFromParent();
      this._colliderDebugMesh.geometry.dispose();
      if (this._colliderDebugMesh.material instanceof THREE.Material) {
        this._colliderDebugMesh.material.dispose();
      }
      this._colliderDebugMesh = undefined;
    }

    super.destroy();
  }

  public toggleVisible(visible: boolean): void {
    if (this._colliderDebugMesh) {
      this._colliderDebugMesh.visible = visible;
    }
  }

  public onCollision(callback: PhysicsCollisionCallback) {
    if (!this.gameObject.scene?.physics) {
      logger({ message: 'RigidBody: Physics world not initialized', type: 'error' });
      return;
    }
    return this.gameObject.scene.physics.onCollision(callback);
  }

  private _createPhysicsBody(): void {
    const scene = this.gameObject.scene;
    const physicsWorld = scene?.physics?.world;

    if (!physicsWorld) {
      logger({ message: 'RigidBody: Physics world not initialized', type: 'error' });
      return;
    }

    // Create rigid body description
    let bodyDesc: RAPIER.RigidBodyDesc;

    switch (this.options.type) {
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
    const pos = this.gameObject.position;
    const quat = this.gameObject.quaternion;

    bodyDesc.setTranslation(pos.x, pos.y, pos.z);
    bodyDesc.setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w });

    // Set damping
    if (this.options.linearDamping) {
      bodyDesc.setLinearDamping(this.options.linearDamping);
    }

    if (this.options.angularDamping) {
      bodyDesc.setAngularDamping(this.options.angularDamping);
    }

    // Create the body
    this._body = physicsWorld.createRigidBody(bodyDesc);

    // Create collider from mesh geometry
    this._createCollider(physicsWorld);

    // Register body with scene
    scene.physics.addBody(this.gameObject, this._body);
  }

  private _createCollider(world: RAPIER.World): void {
    if (!this._body) return;

    // Find the first mesh in the GameObject
    let mesh: THREE.Mesh | undefined;
    this.gameObject.traverse((child) => {
      if (!mesh && child instanceof THREE.Mesh) {
        mesh = child;
      }
    });

    if (!mesh?.geometry) {
      logger({ message: 'RigidBody: No mesh geometry found', type: 'warn' });
      return;
    }

    // Get bounding box and size for collider calculations
    mesh.geometry.computeBoundingBox();
    const bbox = mesh.geometry.boundingBox!;
    const size = new THREE.Vector3();
    bbox.getSize(size);

    // For certain flat geometries, adjust size calculation
    if (mesh.geometry.type === 'PlaneGeometry' || mesh.geometry.type === 'RingGeometry') {
      size.z = Math.max(0.01, size.z);
      size.y = Math.max(0.01, size.y);
      size.x = Math.max(0.01, size.x);
    }

    // Apply GameObject scale to collider size
    size.multiply(this.gameObject.scale);
    // Validate size - prevent NaN, Infinity, or zero values, but only if
    // the mesh type requires valid dimensions
    if (
      !isFinite(size.x) ||
      !isFinite(size.y) ||
      !isFinite(size.z) ||
      size.x <= 0 || size.y <= 0 || (size.z <= 0 && (mesh.geometry.type !== 'PlaneGeometry' && mesh.geometry.type !== 'RingGeometry'))
    ) {
      logger({
        message: `RigidBody: Invalid collider size (${size.x}, ${size.y}, ${size.z}) for ${this.gameObject.name}`,
        type: 'error'
      });
      return;
    }

    const shapeType = this.options.colliderShape ?? RAPIER.ShapeType.Cuboid;

    // Create collider based on specified shape
    const colliderDesc = this._getColliderDesc(shapeType, size);

    // Set material properties
    colliderDesc.setFriction(this.options.friction!);
    colliderDesc.setRestitution(this.options.restitution!);
    colliderDesc.setMass(this.options.mass!);

    this._collider = world.createCollider(colliderDesc, this._body);

    // Create debug visualization mesh
    this._createColliderVisualization(shapeType, size);

    this._events.trigger('colliderready');
  }

  private _getColliderDesc(shapeType: RAPIER.ShapeType, size: THREE.Vector3): RAPIER.ColliderDesc {
    switch (shapeType) {
      case RAPIER.ShapeType.Ball: {
        // Use the largest dimension as the radius
        const radius = Math.max(size.x, size.y, size.z) / 2;
        if (radius <= 0) {
          logger({ message: 'RigidBody: Invalid ball radius', type: 'error' });
          throw new Error('Invalid ball radius');
        }
        return RAPIER.ColliderDesc.ball(radius);
      }

      case RAPIER.ShapeType.Capsule: {
        // Use Y as height, largest of X/Z as radius
        const radius = Math.max(size.x, size.z) / 2;
        const halfHeight = Math.max(0.01, size.y / 2 - radius); // Minimum 0.01 to prevent zero
        if (radius <= 0 || halfHeight <= 0) {
          logger({ message: 'RigidBody: Invalid capsule dimensions', type: 'error' });
          throw new Error('Invalid capsule dimensions');
        }
        return RAPIER.ColliderDesc.capsule(halfHeight, radius);
      }

      case RAPIER.ShapeType.Cylinder: {
        // Use Y as height, largest of X/Z as radius
        const radius = Math.max(size.x, size.z) / 2;
        const halfHeight = size.y / 2;
        if (radius <= 0 || halfHeight <= 0) {
          logger({ message: 'RigidBody: Invalid cylinder dimensions', type: 'error' });
          throw new Error('Invalid cylinder dimensions');
        }
        return RAPIER.ColliderDesc.cylinder(halfHeight, radius);
      }

      case RAPIER.ShapeType.Cone: {
        // Use Y as height, largest of X/Z as radius
        const radius = Math.max(size.x, size.z) / 2;
        const halfHeight = size.y / 2;
        if (radius <= 0 || halfHeight <= 0) {
          logger({ message: 'RigidBody: Invalid cone dimensions', type: 'error' });
          throw new Error('Invalid cone dimensions');
        }
        return RAPIER.ColliderDesc.cone(halfHeight, radius);
      }

      case RAPIER.ShapeType.Cuboid:
      default: {
        // Default to box collider
        const halfX = size.x / 2;
        const halfY = size.y / 2;
        const halfZ = size.z / 2;

        if (halfX <= 0 || halfY <= 0 || (halfZ <= 0)) {
          logger({ message: 'RigidBody: Invalid cuboid dimensions', type: 'error' });
          throw new Error('Invalid cuboid dimensions');
        }
        return RAPIER.ColliderDesc.cuboid(halfX, halfY, halfZ);
      }
    }
  }

  private _createColliderVisualization(shapeType: RAPIER.ShapeType, size: THREE.Vector3): void {
    let geometry: THREE.BufferGeometry;

    switch (shapeType) {
      case RAPIER.ShapeType.Ball: {
        // Ball: radius is max(x,y,z) / 2
        const radius = Math.max(size.x, size.y, size.z) / 2;
        geometry = new THREE.SphereGeometry(radius, 16, 12);
        break;
      }

      case RAPIER.ShapeType.Capsule: {
        // Capsule: Rapier takes halfHeight and radius
        // halfHeight is (totalHeight/2) - radius
        const radius = Math.max(size.x, size.z) / 2;
        const halfHeight = Math.max(0.01, size.y / 2 - radius);
        // THREE.CapsuleGeometry takes radius and length (not halfHeight)
        geometry = new THREE.CapsuleGeometry(radius, halfHeight * 2, 8, 16);
        break;
      }

      case RAPIER.ShapeType.Cylinder: {
        // Cylinder: Rapier takes halfHeight and radius
        const radius = Math.max(size.x, size.z) / 2;
        const halfHeight = size.y / 2;
        // THREE.CylinderGeometry takes full height, not halfHeight
        geometry = new THREE.CylinderGeometry(radius, radius, halfHeight * 2, 16);
        break;
      }

      case RAPIER.ShapeType.Cone: {
        // Cone: Rapier takes halfHeight and radius
        const radius = Math.max(size.x, size.z) / 2;
        const halfHeight = size.y / 2;
        // THREE.ConeGeometry takes full height, not halfHeight
        geometry = new THREE.ConeGeometry(radius, halfHeight * 2, 16);
        break;
      }

      case RAPIER.ShapeType.Cuboid:
      default: {
        // Cuboid: Rapier takes half extents, THREE takes full dimensions
        const halfX = size.x / 2;
        const halfY = size.y / 2;
        const halfZ = size.z / 2;
        // THREE.BoxGeometry expects full dimensions, so multiply by 2
        geometry = new THREE.BoxGeometry(halfX * 2, halfY * 2, halfZ * 2);
        break;
      }
    }

    // Create wireframe material for visualization
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      opacity: 1
    });

    this._colliderDebugMesh = new THREE.Mesh(geometry, material);
    this._colliderDebugMesh.name = 'ColliderDebug';
    this._colliderDebugMesh.visible = false;

    // CRITICAL: The size passed to this function already includes GameObject.scale
    // But when we add the mesh as a child of GameObject, it will inherit scale again
    // So we need to DIVIDE by the GameObject's scale to compensate
    const inverseScale = new THREE.Vector3(
      1 / this.gameObject.scale.x,
      1 / this.gameObject.scale.y,
      1 / this.gameObject.scale.z
    );
    this._colliderDebugMesh.scale.copy(inverseScale);

    // Position at center of GameObject
    this._colliderDebugMesh.position.set(0, 0, 0);

    // Add to GameObject
    this.gameObject.add(this._colliderDebugMesh);
  }
}