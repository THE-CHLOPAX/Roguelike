import * as THREE from 'three';
import { logger, KeyboardInput, MouseInput } from '@tgdf';

import { Emitter } from '../Emitter';
import { GameObject } from '../GameObject';
import { PhysicsManager } from '../PhysicsManager';
import { ResourceTracker } from '../ResourceTracker/ResourceTracker';
import { SceneConstructorOptions, SceneEventsMap } from '../types/scene';

export abstract class Scene<T extends SceneEventsMap = SceneEventsMap> extends THREE.Scene {
  public abstract camera: THREE.Camera;

  private _emitter = new Emitter<T>();
  private _renderer: THREE.WebGLRenderer | null = null;
  private _keyboardInput?: KeyboardInput;
  private _mouseInput?: MouseInput;

  private _physicsManager?: PhysicsManager;
  private _resourceTrackerMap = new Map<string, ResourceTracker>();

  constructor(options?: SceneConstructorOptions) {
    super();

    this._keyboardInput = options?.keyboardHandlers;
    this._mouseInput = options?.mouseHandlers;

    if (options?.physics) this._initializePhysicsWorld(options.physics.gravity);
  }

  public get keyboardInput(): KeyboardInput | undefined {
    return this._keyboardInput;
  }

  public get mouseInput(): MouseInput | undefined {
    return this._mouseInput;
  }

  public get events(): Emitter<T> {
    return this._emitter;
  }

  public get physics(): PhysicsManager | undefined {
    return this._physicsManager;
  }

  public get renderer(): THREE.WebGLRenderer | null {
    return this._renderer;
  }

  public update(deltaTime: number, renderer: THREE.WebGLRenderer | null): void {
    // Update physics world with deltaTime for fixed time step
    this.physics?.update(deltaTime);

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
    this._resourceTrackerMap.forEach((tracker) => tracker.dispose());
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

  public disableInput(): void {
    this._keyboardInput?.disable();
    this._mouseInput?.disable();
  }

  public enableInput(): void {
    this._keyboardInput?.enable();
    this._mouseInput?.enable();
  }

  protected onUpdate(_deltaTime: number): void {}

  private async _initializePhysicsWorld(gravity: THREE.Vector3): Promise<void> {
    this._physicsManager = new PhysicsManager();
    await this._physicsManager.init(gravity);
    logger({ message: 'Scene: Physics world initialized', type: 'info' });
  }
}
