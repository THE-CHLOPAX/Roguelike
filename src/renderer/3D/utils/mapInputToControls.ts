import { InputState, GamepadButton } from '@tgdf';

export type ControlsState = null | 'run' | 'sprint' | 'attack';

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
        return attack as ControlsState;
      }
    }
  }

  // Priority 2: Check for sprint
  if (inputState.keyboard.isKeyPressed('ShiftLeft') || inputState.gamepad.isButtonPressed('RB')) {
    return 'sprint';
  }

  // Priority 3: Check for run (movement keys/sticks)
  const hasKeyboardMovement =
    inputState.keyboard.isKeyPressed('KeyW') ||
    inputState.keyboard.isKeyPressed('KeyS') ||
    inputState.keyboard.isKeyPressed('KeyA') ||
    inputState.keyboard.isKeyPressed('KeyD');

  const leftStickX = inputState.gamepad.getAxisValue('LEFT_STICK_X');
  const leftStickY = inputState.gamepad.getAxisValue('LEFT_STICK_Y');
  const hasGamepadMovement =
    Math.abs(leftStickX) > AXIS_DEADZONE || Math.abs(leftStickY) > AXIS_DEADZONE;

  if (hasKeyboardMovement || hasGamepadMovement) {
    return 'run';
  }

  return null;
}
