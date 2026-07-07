import * as THREE from 'three';
import {
  ResourceTracker,
  GameObjectComponent,
  GameObjectConstructorOptions,
  GameObjectEventMap,
  Input,
  InputState,
  logger,
} from '@tgdf';

import { Emitter } from './Emitter';
import { Scene } from './Scene/Scene';
import { GAME_OBJECT_MESSAGES } from './constants';
import { InputNotifiable } from '../internal-input/Input';
import { isChildOfObject } from './utils/isChildOfObject';

export class GameObject extends THREE.Object3D implements InputNotifiable {
  private _gameObjectComponents: Map<string, GameObjectComponent>;
  private _scene: Scene;
  private _emitter: Emitter<GameObjectEventMap> = new Emitter<GameObjectEventMap>();
  private _isAwake: boolean = false;

  constructor({ scene }: GameObjectConstructorOptions) {
    super();
    this._scene = scene;
    this._gameObjectComponents = new Map<string, GameObjectComponent>();

    Input.registerNotifiable(this);
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

    this.events.trigger('update', { deltaTime });

    this.onUpdate(deltaTime);
  }

  public addComponent<C extends GameObjectComponent>(name: string, component: C): C {
    const alreadyAddedComponent = this._gameObjectComponents.get(name);
    if (alreadyAddedComponent) {
      logger({
        message: GAME_OBJECT_MESSAGES.ADD_COMPONENT_DUPLICATE(name),
        type: 'warn',
      });
      return alreadyAddedComponent as C;
    }

    this._gameObjectComponents.set(name, component);
    return component;
  }

  public removeComponent(name: string): void {
    const component = this._gameObjectComponents.get(name);
    if (!component) {
      logger({
        message: GAME_OBJECT_MESSAGES.REMOVE_COMPONENT_NOT_FOUND(name),
        type: 'warn',
      });
      return;
    }
    component.destroy();
    this._gameObjectComponents.delete(name);
  }

  public destroy(): void {
    // Unregister from Input singleton
    Input.unregisterNotifiable(this);

    this._emitter.trigger('destroyed');
    this._gameObjectComponents.clear();

    this.children.forEach((child) => {
      this.remove(child);
    });

    this.removeFromParent();
    this.onDestroyed();
    this._isAwake = false;
  }

  public override add(...objects: THREE.Object3D[]): this {
    super.add(...objects);

    objects.forEach((object) => {
      logger({
        message: GAME_OBJECT_MESSAGES.ADDING_OBJECT_TO_GAME_OBJECT(object),
        type: 'info',
      });
      ResourceTracker.trackObject(object);
    });

    return this;
  }

  public override remove(...objects: THREE.Object3D[]): this {
    super.remove(...objects);

    objects.forEach((object) => {
      logger({
        message: GAME_OBJECT_MESSAGES.REMOVING_OBJECT_FROM_GAME_OBJECT(object),
        type: 'info',
      });
      ResourceTracker.disposeObjectResources(object);
      ResourceTracker.untrackObject(object);
    });

    return this;
  }

  public onInputNotify(_inputState: InputState): void {
    this.onInput(_inputState);

    this._emitter.trigger('input', { inputState: _inputState });
  }

  protected onAwake(): void {}

  protected onUpdate(_deltaTime: number): void {}

  protected onDestroyed(): void {}

  protected onInput(_inputState: InputState): void {}

  private _onAwakeHandler = () => {
    this._isAwake = true;
    this._emitter.trigger('awake');
    this.onAwake();
  };
}
