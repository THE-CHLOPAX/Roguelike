import { GameObjectComponent, KeyboardInput } from '@tgdf';

import { MovableGameObject } from '../gameObjects/MovableGameObject';
import { OrtographicCameraWithControls } from '../cameras/OrtographicCameraWithControls';

export type GamepadControlsOptions = {
  gameObject: MovableGameObject;
  camera: OrtographicCameraWithControls;
  keyboardInput: KeyboardInput;
  cameraLerp?: number;
};

export class GamepadControls extends GameObjectComponent {}
