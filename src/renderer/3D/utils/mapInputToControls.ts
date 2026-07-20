import * as THREE from 'three';
import { InputState, GamepadButton } from '@tgdf';

import { PlayerActionType } from '../types';

export type ControlsState =
  | {
      type: PlayerActionType.RUN | PlayerActionType.SPRINT;
      direction: THREE.Vector3;
    }
  | {
      type:
        | PlayerActionType.IDLE
        | PlayerActionType.ACTION_UP
        | PlayerActionType.ACTION_DOWN
        | PlayerActionType.ACTION_LEFT
        | PlayerActionType.ACTION_RIGHT
        | PlayerActionType.ACTION_FOCUS;
    };

const AXIS_DEADZONE = 0.15;

export function mapInputToControls(inputState: InputState): ControlsState {
  // Priority 1: Check for action inputs
  const actionMappings = {
    [PlayerActionType.ACTION_UP]: ['ArrowUp', 'DPAD_UP'],
    [PlayerActionType.ACTION_DOWN]: ['ArrowDown', 'DPAD_DOWN'],
    [PlayerActionType.ACTION_LEFT]: ['ArrowLeft', 'DPAD_LEFT'],
    [PlayerActionType.ACTION_RIGHT]: ['ArrowRight', 'DPAD_RIGHT'],
    [PlayerActionType.ACTION_FOCUS]: ['Space', 'RT'],
  } as const;

  for (const action of Object.keys(actionMappings)) {
    for (const key of actionMappings[action as keyof typeof actionMappings]) {
      if (
        inputState.keyboard.isKeyPressed(key) ||
        inputState.gamepad.isButtonPressed(key as GamepadButton)
      ) {
        return { type: action as keyof typeof actionMappings };
      }
    }
  }

  // Priority 2: Check for sprint
  const getMovementDirection = () => {
    const direction = new THREE.Vector3();

    if (inputState.keyboard.isKeyPressed('KeyW')) direction.z -= 1;
    if (inputState.keyboard.isKeyPressed('KeyS')) direction.z += 1;
    if (inputState.keyboard.isKeyPressed('KeyA')) direction.x -= 1;
    if (inputState.keyboard.isKeyPressed('KeyD')) direction.x += 1;

    const leftStickX = inputState.gamepad.getAxisValue('LEFT_STICK_X');
    const leftStickY = inputState.gamepad.getAxisValue('LEFT_STICK_Y');

    if (Math.abs(leftStickY) > AXIS_DEADZONE) {
      direction.z += leftStickY;
    }
    if (Math.abs(leftStickX) > AXIS_DEADZONE) {
      direction.x += leftStickX;
    }
    return direction;
  };

  if (inputState.keyboard.isKeyPressed('ShiftLeft') || inputState.gamepad.isButtonPressed('RB')) {
    return { type: PlayerActionType.SPRINT, direction: getMovementDirection() };
  }

  // Priority 3: Check for run (movement keys/sticks)
  const hasMovementDirection = getMovementDirection().length() > 0;

  if (hasMovementDirection) {
    return { type: PlayerActionType.RUN, direction: getMovementDirection() };
  }

  return { type: PlayerActionType.IDLE };
}
