import { Scene, GameObject, GameObjectEventMap, KeyboardInput, MouseInput } from '@tgdf';

export abstract class GameObjectComponent<
  T = unknown,
  U extends GameObjectEventMap = GameObjectEventMap,
> {
  private _gameObject: GameObject<U>;
  protected options: Partial<T>;

  constructor(gameObject: GameObject<U>, options?: Partial<T>) {
    this._gameObject = gameObject;
    this.options = options ?? {};

    if (this._gameObject.isAwake) {
      this.onAwake();
    } else {
      this._gameObject.events.once('awake', this.onAwake.bind(this));
    }
  }

  public get gameObject(): GameObject<U> {
    return this._gameObject;
  }

  public destroy(): void {
    this.onDestroyed();
  }

  public update(deltaTime: number): void {
    this.onUpdate(deltaTime);
  }

  public get scene(): Scene | undefined {
    return this.gameObject.scene;
  }

  protected getKeyboardInput(): KeyboardInput | undefined {
    return this.gameObject.scene?.keyboardInput;
  }

  protected getMouseInput(): MouseInput | undefined {
    return this.gameObject.scene?.mouseInput;
  }

  protected onUpdate(_deltaTime: number): void {}

  protected onAwake(): void {}

  protected onDestroyed(): void {}
}
