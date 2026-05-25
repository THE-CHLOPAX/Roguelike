import * as THREE from 'three';
import { InputState, GamepadButton } from '@tgdf';

export type ControlsState =
  | null
  | {
      type: 'run' | 'sprint';
      direction: THREE.Vector3;
    }
  | { type: 'attack' };

const AXIS_DEADZONE = 0.15;

export function mapInputToControls(inputState: InputState): ControlsState {
  // Priority 1: Check for attack inputs
  const attackMappings = {
    attack: ['ArrowUp', 'DPAD_UP'],
  };

  for (const attack of Object.keys(attackMappings)) {
    for (const key of attackMappings[attack as keyof typeof attackMappings]) {
      if (
        inputState.keyboard.isKeyPressed(key) ||
        inputState.gamepad.isButtonPressed(key as GamepadButton)
      ) {
        return { type: 'attack' };
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
    return { type: 'sprint', direction: getMovementDirection() };
  }

  // Priority 3: Check for run (movement keys/sticks)
  const hasMovementDirection = getMovementDirection().length() > 0;

  if (hasMovementDirection) {
    return { type: 'run', direction: getMovementDirection() };
  }

  return null;
}
