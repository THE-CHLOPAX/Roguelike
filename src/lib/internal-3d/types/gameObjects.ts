import { Scene } from '../Scene/Scene';

export type GameObjectComponentTemplate = {
  name: string;
  options?: unknown;
};

export type GameObjectConstructorOptions = {
  scene: Scene;
};

export type GameObjectEventMap = {
  awake: void;
  destroyed: void;
  update: { deltaTime: number };
};
