import * as THREE from 'three';
import {
  GameObjectComponent,
  GameObjectConstructorOptions,
  GameObjectEventMap,
  Input,
  InputState,
  logger,
} from '@tgdf';

import { Emitter } from './Emitter';
import { Scene } from './Scene/Scene';
import { isChildOfObject } from './utils/isChildOfObject';
import { ResourceTracker } from './ResourceTracker/ResourceTracker';

export class GameObject extends THREE.Object3D {
  private _gameObjectComponents: Map<string, GameObjectComponent>;
  private _scene: Scene;
  private _emitter: Emitter<GameObjectEventMap> = new Emitter<GameObjectEventMap>();
  private _isAwake: boolean = false;
  private _resourceTrackerMap = new Map<string, ResourceTracker>();

  constructor({ scene }: GameObjectConstructorOptions) {
    super();
    this._scene = scene;
    this._gameObjectComponents = new Map<string, GameObjectComponent>();

    Input.registerGameObject(this);
  }

  public get scene(): Scene | undefined {
    return this._scene;
  }

  public get gameObjectComponents(): Map<string, GameObjectComponent> {
    return this._gameObjectComponents;
  }

  public get events(): Emitter<GameObjectEventMap> {
    return this._emitter;
  }

  public get isAwake(): boolean {
    return this._isAwake;
  }

  public getGameObjectComponentByType<C extends GameObjectComponent>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: new (...args: any[]) => C
  ): C | undefined {
    for (const component of this._gameObjectComponents.values()) {
      if (component instanceof type) {
        return component as C;
      }
    }
    return undefined;
  }

  public update(deltaTime: number): void {
    const scene = this.scene;
    if (scene) {
      if (isChildOfObject(this, scene) && !this.isAwake) {
        this._onAwakeHandler();
      }
    }

    this._gameObjectComponents.forEach((component) => {
      component.update(deltaTime);
    });

    this.events.trigger('update', { deltaTime });

    this.onUpdate(deltaTime);
  }

  public addComponent<C extends GameObjectComponent>(name: string, component: C): C {
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
    // Unregister from Input singleton
    Input.unregisterGameObject(this);

    this._gameObjectComponents.forEach((component) => {
      component.destroy();
    });
    this._gameObjectComponents.clear();
    this.removeFromParent();
    this._emitter.trigger('destroyed');
    this.onDestroyed();
    this._isAwake = false;
  }

  public override add(...objects: THREE.Object3D[]): this {
    super.add(...objects);

    objects.forEach((object) => {
      logger({
        message: `GameObject: Adding object to GameObject: ${object.name || object.type}`,
        type: 'info',
      });
      this.addObjectResourceTracker(object);
    });

    return this;
  }

  public override remove(...objects: THREE.Object3D[]): this {
    super.remove(...objects);

    objects.forEach((object) => {
      logger({
        message: `GameObject: Removing object from GameObject: ${object.name || object.type}`,
        type: 'info',
      });
      this.removeObjectResourceTracker(object);
    });

    return this;
  }

  public addObjectResourceTracker(object: THREE.Object3D): void {
    const resourceTracker = new ResourceTracker();
    resourceTracker.track(object);
    this._resourceTrackerMap.set(object.uuid, resourceTracker);
  }

  public removeObjectResourceTracker(object: THREE.Object3D): void {
    const resourceTracker = this._resourceTrackerMap.get(object.uuid);
    if (resourceTracker) {
      resourceTracker.dispose();
      this._resourceTrackerMap.delete(object.uuid);
    }
  }

  protected onAwake(): void {}

  protected onUpdate(_deltaTime: number): void {}

  public onInput(_inputState: InputState): void {}

  protected onDestroyed(): void {}

  private _onAwakeHandler = () => {
    this._isAwake = true;
    this._emitter.trigger('awake');
    this.onAwake();
  };
}
