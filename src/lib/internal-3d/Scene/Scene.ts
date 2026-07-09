import * as THREE from 'three';
import { init } from '@recast-navigation/core';
import { logger, ResourceTracker } from '@tgdf';

import { Emitter } from '../Emitter';
import { SCENE_MESSAGES } from './constants';
import { SceneEventsMap } from '../types/scene';
import { GameObject } from '../GameObject/GameObject';
import { PhysicsManager } from '../PhysicsManager/PhysicsManager';
import { NavMeshManager, NavMeshManagerOptions } from '../NavMeshManager';

export abstract class Scene extends THREE.Scene {
  public abstract camera: THREE.Camera;

  private _emitter = new Emitter<SceneEventsMap>();
  private _renderer: THREE.WebGLRenderer | null = null;

  private _physicsManager?: PhysicsManager;
  private _navMeshManager?: NavMeshManager;

  constructor() {
    super();
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
    // Assign current renderer
    if (this._renderer !== renderer) this.events.trigger('rendererChange', { renderer });
    this._renderer = renderer;

    // Update camera
    if ('update' in this.camera) {
      (this.camera as { update: () => void }).update();
    }

    // Update GameObjects first so kinematic visuals are current before physics
    this.traverse((child) => {
      if (child instanceof GameObject) {
        child.update(deltaTime);
      }
    });

    // Step physics after kinematic bodies have synced their colliders
    this.physics?.update(deltaTime);

    // Pull dynamic body transforms back to visuals after simulation
    this.physics?.syncDynamicBodies();

    // Update navmesh manager
    if (this._navMeshManager) {
      this._navMeshManager.update(deltaTime);
    }

    this.events.trigger('update', { deltaTime });

    this.onUpdate(deltaTime);
  }

  public dispose(): void {
    this._emitter.removeAll();

    const childrenToRemove = [...this.children];

    childrenToRemove.forEach((child) => {
      this.remove(child);
    });

    this._physicsManager?.dispose();
  }

  public override add(...objects: THREE.Object3D[]): this {
    objects.forEach((object) => {
      logger({
        message: SCENE_MESSAGES.ADDING_OBJECT(object),
        type: 'info',
      });
      super.add(object);

      ResourceTracker.trackObject(object);
    });

    return this;
  }

  public override remove(...objects: THREE.Object3D[]): this {
    objects.forEach((object) => {
      logger({
        message: SCENE_MESSAGES.REMOVING_OBJECT(object),
        type: 'info',
      });

      object.traverse((child) => {
        if (child instanceof GameObject) {
          child.destroy();
        }
      });

      super.remove(object);

      ResourceTracker.disposeObjectResources(object);
      ResourceTracker.untrackObject(object);
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

  public async initializePhysicsWorld(gravity: THREE.Vector3): Promise<void> {
    this._physicsManager = new PhysicsManager();
    await this._physicsManager.init(gravity);
    logger({ message: SCENE_MESSAGES.PHYSICS_WORLD_INITIALIZED, type: 'info' });
  }

  protected onUpdate(_deltaTime: number): void {}
}
