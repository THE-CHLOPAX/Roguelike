import * as THREE from 'three';
import { logger, KeyboardInput, MouseInput } from '@tgdf';

import { Emitter } from '../Emitter';
import { GameObject } from '../GameObject';
import { PhysicsManager } from '../PhysicsManager';
import { processChildRecursive } from '../utils/processChildRecursive';
import { SceneConstructorOptions, SceneEventsMap } from '../types/scene';

export abstract class Scene<T extends SceneEventsMap = SceneEventsMap> extends THREE.Scene {
  public abstract camera: THREE.Camera;

  private _emitter = new Emitter<T>();
  private _keyboardInput?: KeyboardInput;
  private _mouseInput?: MouseInput;

  private _physicsManager?: PhysicsManager;

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

  public update(deltaTime: number): void {
    // Update physics world with deltaTime for fixed time step
    this.physics?.update(deltaTime);

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
    // Safety check: ensure scene has children before traversing
    if (!this.children || this.children.length === 0) {
      logger({ message: 'Scene: No children to dispose of in the scene.', type: 'warn' });
      this._physicsManager?.dispose();
      return;
    }

    try {
      // Create a copy of children array to avoid modification during iteration
      const childrenCopy = [...this.children];

      childrenCopy.forEach((child) => {
        if (child instanceof GameObject) {
          child.destroy();
        } else if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat?.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });

      this._emitter.removeAll();
    } catch (error) {
      logger({ message: 'Scene: Error during disposal:', type: 'error' });
    }

    this._physicsManager?.dispose();
  }

  public disableInput(): void {
    this._keyboardInput?.disable();
    this._mouseInput?.disable();
  }

  public enableInput(): void {
    this._keyboardInput?.enable();
    this._mouseInput?.enable();
  }

  public addAndConvertChildrenRecursive(children: THREE.Object3D[]): void {
    const clonedChildren = [...children];
    clonedChildren.forEach((child) => {
      processChildRecursive(child, this, this);
    });
  }

  protected onUpdate(_deltaTime: number): void {}

  private async _initializePhysicsWorld(gravity: THREE.Vector3): Promise<void> {
    this._physicsManager = new PhysicsManager();
    await this._physicsManager.init(gravity);
    logger({ message: 'Physics world initialized', type: 'info' });
  }
}
