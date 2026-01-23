import * as THREE from 'three';
import { GameObjectComponent, GameObjectConstructorOptions, GameObjectEventMap } from '@tgdf';

import { Emitter } from './Emitter';
import { Scene } from './Scene/Scene';
import { SceneEventsMap } from './types/scene';
import { logger } from '../internal-ui/utils/logger';

export class GameObject<T extends GameObjectEventMap = GameObjectEventMap, K extends SceneEventsMap = SceneEventsMap> extends THREE.Object3D {

  private _gameObjectComponents: Map<string, GameObjectComponent<unknown, K, T>>;
  private _scene: Scene<K>;
  private _emitter: Emitter<T> = new Emitter<T>();
  private _object: THREE.Object3D;
  private _isAwake: boolean = false;

  constructor({ scene, object }: GameObjectConstructorOptions<K>) {
    super();
    this._scene = scene;
    this._object = object;
    this._gameObjectComponents = new Map<string, GameObjectComponent<unknown, K, T>>();

    // If object is a mesh, copy its geometry and material
    if (object instanceof THREE.Mesh) {
      const meshCopy = new THREE.Mesh();
      meshCopy.copy(object, true);

      // Copy shadow properties explicitly
      meshCopy.castShadow = object.castShadow;
      meshCopy.receiveShadow = object.receiveShadow;

      // Reset transform on the mesh copy since parent GameObject has the transform
      meshCopy.position.set(0, 0, 0);
      meshCopy.rotation.set(0, 0, 0);
      meshCopy.scale.set(1, 1, 1);
      meshCopy.quaternion.identity();

      this.add(meshCopy);
    }

    // copy entire object (without children) into this GameObject
    this.copy(object, false);
  }

  public get mesh(): THREE.Mesh | null {
    if (this._object instanceof THREE.Mesh) {
      return this._object;
    } else {
      logger({ message: `GameObject: ${this.name} this object 3D is not instance of a mesh.`, type: 'warn' });
      return null;
    }
  }

  public get object(): THREE.Object3D {
    return this._object;
  }

  public get scene(): Scene<K> | undefined {
    return this._scene;
  }

  public get gameObjectComponents(): Map<string, GameObjectComponent<unknown, K, T>> {
    return this._gameObjectComponents;
  }

  public get events(): Emitter<T> {
    return this._emitter;
  }

  public get isAwake(): boolean {
    return this._isAwake;
  }

  public update(deltaTime: number): void {
    if (this.scene?.children.includes(this) && !this.isAwake) {
      this._onAwakeHandler();
    }

    this._gameObjectComponents.forEach((component) => {
      component.update(deltaTime);
    });

    this.events.trigger('update', { deltaTime });

    this.onUpdate(deltaTime);
  }

  public addComponent<C extends GameObjectComponent<unknown, K, T>>(name: string, component: C): C {
    this._gameObjectComponents.set(name, component);
    return component;
  }

  public removeComponent(name: string): void {
    const component = this._gameObjectComponents.get(name);
    if (component) {
      component.destroy();
      this._gameObjectComponents.delete(name);
    }
  }

  public destroy(): void {
    this._gameObjectComponents.forEach((component) => {
      component.destroy();
    });
    this._gameObjectComponents.clear();
    this.removeFromParent();
    this._emitter.trigger('destroyed');
    this.onDestroyed();
    this._isAwake = false;
  }

  protected onAwake(): void { }

  protected onUpdate(_deltaTime: number): void { }

  protected onDestroyed(): void { }

  private _onAwakeHandler = () => {
    this._isAwake = true;
    this._emitter.trigger('awake');
    this.onAwake();
  };
}