import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Emitter } from '../internal-3d/Emitter';
import { GamepadInstance } from '../internal-input/Gamepad/GamepadInstance';

export type GamepadEventMap = {
  'gamepadconnected': { gamepad: GamepadInstance };
  'gamepaddisconnected': { gamepad: GamepadInstance };
}

export type GamepadState = {
  connectedGamepads: Map<number, GamepadInstance>;
  gamepadEvents: Emitter<GamepadEventMap>;
  setConnectedGamepads: (gamepads: Map<number, GamepadInstance>) => void;
}

export const useGamepadStore = create<GamepadState>()(
  devtools(
    (set) => ({
      connectedGamepads: new Map(),
      gamepadEvents: new Emitter<GamepadEventMap>(),

      setConnectedGamepads: (gamepads: Map<number, GamepadInstance>) => set({ connectedGamepads: gamepads }),
    }),
    {
      name: 'gamepad-store',
    }
  )
);

function handleGamepadConnected(e: GamepadEvent) {
  const { gamepadEvents, connectedGamepads, setConnectedGamepads } = useGamepadStore.getState();
  gamepadEvents.trigger('gamepadconnected', { gamepad: new GamepadInstance(e.gamepad) });
  // Add to connected gamepads state
  setConnectedGamepads(new Map(connectedGamepads).set(e.gamepad.index, new GamepadInstance(e.gamepad)));
}

function handleGamepadDisconnected(e: GamepadEvent) {
  const { gamepadEvents, connectedGamepads, setConnectedGamepads } = useGamepadStore.getState();
  gamepadEvents.trigger('gamepaddisconnected', { gamepad: new GamepadInstance(e.gamepad) });
  // Remove from connected gamepads state
  const updatedGamepads = new Map(connectedGamepads);
  updatedGamepads.delete(e.gamepad.index);
  setConnectedGamepads(updatedGamepads);
}

// Listen for gamepad connection events
window.addEventListener('gamepadconnected', handleGamepadConnected);
window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);