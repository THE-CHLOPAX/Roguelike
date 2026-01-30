import {
  GamepadButton as GamepadButtonName,
  GamepadAxis as GamepadAxisName,
} from './Gamepad/GamepadMappings';

export type KeyMatcher = string | string[] | ((e: KeyboardEvent) => boolean);

export type MouseButton = 'left' | 'right' | 'middle';
export type ButtonMatcher = MouseButton | MouseButton[] | ((e: MouseEvent) => boolean);

export type MouseHandlerRecord = {
  matcher: ButtonMatcher;
  handler: (e: MouseEvent) => void;
};

export type KeyboardHandlerRecord = {
  matcher: KeyMatcher;
  handler: (e: KeyboardEvent) => void;
};

export type KeyboardInput = {
  addKeyPressListener: (
    matcher: KeyMatcher,
    handler: (e: KeyboardEvent) => void,
    thresholdMs?: number,
    once?: boolean
  ) => () => void;
  addKeyDownListener: (
    matcher: KeyMatcher,
    handler: (e: KeyboardEvent) => void,
    once?: boolean
  ) => () => void;
  addKeyUpListener: (
    matcher: KeyMatcher,
    handler: (e: KeyboardEvent) => void,
    once?: boolean
  ) => () => void;
  onAnyInteraction: (handler: (e: KeyboardEvent) => void, once?: boolean) => () => void;
  removeKeyDownListener: (matcher: KeyMatcher, handler: (e: KeyboardEvent) => void) => void;
  removeKeyPressListener: (matcher: KeyMatcher, handler: (e: KeyboardEvent) => void) => void;
  removeKeyUpListener: (matcher: KeyMatcher, handler: (e: KeyboardEvent) => void) => void;
  removeAllListeners: () => void;
  disable: () => void;
  enable: () => void;
};

export type MouseInput = {
  mouseX: number;
  mouseY: number;
  addMouseScrollListener: (handler: (e: WheelEvent) => void, once?: boolean) => () => void;
  addMouseMoveListener: (handler: (e: MouseEvent) => void, once?: boolean) => () => void;
  addMouseClickListener: (
    matcher: ButtonMatcher,
    handler: (e: MouseEvent) => void,
    once?: boolean
  ) => () => void;
  addMouseUpListener: (
    matcher: ButtonMatcher,
    handler: (e: MouseEvent) => void,
    once?: boolean
  ) => () => void;
  onAnyInteraction: (handler: (e: MouseEvent) => void, once?: boolean) => () => void;
  removeMouseScrollListener: (handler: (e: WheelEvent) => void) => void;
  removeMouseMoveListener: (handler: (e: MouseEvent) => void) => void;
  removeMouseClickListener: (matcher: ButtonMatcher, handler: (e: MouseEvent) => void) => void;
  removeMouseUpListener: (matcher: ButtonMatcher, handler: (e: MouseEvent) => void) => void;
  removeAllListeners: () => void;
  disable: () => void;
  enable: () => void;
};

export type GamepadInput = {
  addButtonPressListener: (
    button: GamepadButtonName,
    handler: (pressed: boolean, value: number) => void,
    thresholdMs?: number,
    once?: boolean
  ) => () => void;
  addButtonDownListener: (
    button: GamepadButtonName,
    handler: () => void,
    once?: boolean
  ) => () => void;
  addButtonUpListener: (
    button: GamepadButtonName,
    handler: () => void,
    once?: boolean
  ) => () => void;
  addAxisMoveListener: (
    axis: GamepadAxisName | number,
    callback: (value: number) => void,
    once?: boolean
  ) => () => void;
  onAnyInteraction: (handler: () => void, once?: boolean) => () => void;
  removeButtonDownListener: (
    button: GamepadButtonName,
    handler: (pressed: boolean, value: number) => void,
    thresholdMs?: number
  ) => void;
  removeButtonPressListener: (
    button: GamepadButtonName,
    handler: (pressed: boolean, value: number) => void
  ) => void;
  removeAxisMoveListener: (
    axis: GamepadAxisName | number,
    callback: (value: number) => void
  ) => void;
  removeAllListeners: () => void;
  disable: () => void;
  enable: () => void;
};

export type GamepadButtonState = {
  pressed: boolean;
  value: number;
};

export type ButtonListener = {
  button: GamepadButtonName | number;
  callback: (pressed: boolean, value: number) => void;
  type: 'down' | 'press' | 'up';
  threshold?: number; // Milliseconds threshold for 'press' type
  pressStartTime?: number; // Internal tracking for press threshold
};

export type AxisListener = {
  axis: GamepadAxisName | number;
  callback: (value: number) => void;
};
