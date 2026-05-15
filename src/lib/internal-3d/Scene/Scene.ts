import * as THREE from 'three';
import { logger } from '@tgdf';
import { init } from '@recast-navigation/core';

import { Emitter } from '../Emitter';
import { GameObject } from '../GameObject';
import { Input } from '../../internal-input/Input';
import { PhysicsManager } from '../PhysicsManager';
import { ResourceTracker } from '../ResourceTracker/ResourceTracker';
import { SceneConstructorOptions, SceneEventsMap } from '../types/scene';
import { NavMeshManager, NavMeshManagerOptions } from '../NavMeshManager';

export abstract class Scene extends THREE.Scene {
  public abstract camera: THREE.Camera;

  private _emitter = new Emitter<SceneEventsMap>();
  private _renderer: THREE.WebGLRenderer | null = null;
  private _input: Input;

  private _physicsManager?: PhysicsManager;
  private _navMeshManager?: NavMeshManager;
  private _resourceTrackerMap = new Map<string, ResourceTracker>();

  constructor(options?: SceneConstructorOptions) {
    super();

    // Get the global Input singleton instance
    this._input = Input.getInstance();

    if (options?.physics) this._initializePhysicsWorld(options.physics.gravity);
  }

  /**
   * Access the global Input instance for keyboard, mouse, and gamepad handling.
   * @deprecated Use `Input.getInstance()` or `input` singleton directly instead.
   */
  public get keyboardInput(): Input {
    return this._input;
  }

  /**
   * Access the global Input instance for keyboard, mouse, and gamepad handling.
   * @deprecated Use `Input.getInstance()` or `input` singleton directly instead.
   */
  public get mouseInput(): Input {
    return this._input;
  }

  /**
   * Access the global Input instance for keyboard, mouse, and gamepad handling.
   */
  public get input(): Input {
    return this._input;
  }

  public get events(): Emitter<SceneEventsMap> {
    return this._emitter;
  }

  public get physics(): PhysicsManager | undefined {
    return this._physicsManager;
  }

  public get navMeshManager(): NavMeshManager | undefined {
    return this._navMeshManager;
  }

  public get renderer(): THREE.WebGLRenderer | null {
    return this._renderer;
  }

  public update(deltaTime: number, renderer: THREE.WebGLRenderer | null): void {
    // Update physics world with deltaTime for fixed time step
    this.physics?.update(deltaTime);

    // Update navmesh manager
    if (this._navMeshManager) {
      this._navMeshManager.update(deltaTime);
    }

    // Assign current renderer
    if (this._renderer !== renderer) this.events.trigger('rendererChange', { renderer });
    this._renderer = renderer;

    // Update all GameObjects
    this.traverse((child) => {
      if (child instanceof GameObject) {
        child.update(deltaTime);
      }
    });

    this.events.trigger('update', { deltaTime });

    this.onUpdate(deltaTime);
  }

  public dispose(): void {
    this._emitter.removeAll();
    this._physicsManager?.dispose();

    const childrenToRemove = [...this.children];

    childrenToRemove.forEach((child) => {
      this.remove(child);
    });

    this._resourceTrackerMap.clear();
  }

  public override add(...objects: THREE.Object3D[]): this {
    objects.forEach((object) => {
      logger({
        message: `Scene: Adding object to scene: ${object.name || object.type}`,
        type: 'info',
      });
      super.add(object);

      const resourceTracker = new ResourceTracker();
      resourceTracker.track(object);
      this._resourceTrackerMap.set(object.uuid, resourceTracker);
    });

    return this;
  }

  public override remove(...objects: THREE.Object3D[]): this {
    objects.forEach((object) => {
      logger({
        message: `Scene: Removing object from scene: ${object.name || object.type}`,
        type: 'info',
      });
      super.remove(object);

      const resourceTracker = this._resourceTrackerMap.get(object.uuid);
      if (resourceTracker) {
        resourceTracker.dispose();
        this._resourceTrackerMap.delete(object.uuid);
      }
    });

    return this;
  }

  public async initializeNavMeshManager(
    floorObject: THREE.Object3D,
    options?: NavMeshManagerOptions
  ): Promise<void> {
    await init();
    this._navMeshManager = new NavMeshManager(this, floorObject, options);
  }

  protected onUpdate(_deltaTime: number): void {}

  private async _initializePhysicsWorld(gravity: THREE.Vector3): Promise<void> {
    this._physicsManager = new PhysicsManager();
    await this._physicsManager.init(gravity);
    logger({ message: 'Scene: Physics world initialized', type: 'info' });
  }
}
