import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GamepadInstance, useGamepadStore } from '@tgdf';

export type ActivePlayerState = {
  id: number;
  name: string;
  controls: 'keyboard' | 'gamepad';
  gamepadIndex?: number; // Only for gamepad controls
};

export type ActivePlayersState = {
  basePlayer: ActivePlayerState;
  additionalPlayers: Set<ActivePlayerState>;
  activePlayers: Set<ActivePlayerState>;
  setAdditionalPlayers: (players: Set<ActivePlayerState>) => void;
  setBasePlayer: (player: ActivePlayerState) => void;
};

const initialBasePlayer: ActivePlayerState = {
  id: 0,
  name: 'Player 1',
  controls: 'keyboard',
};

export const useActivePlayersStore = create<ActivePlayersState>()(
  devtools(
    persist(
      (set, get) => ({
        basePlayer: initialBasePlayer,
        additionalPlayers: new Set(),
        activePlayers: new Set([initialBasePlayer]),
        setAdditionalPlayers: (players: Set<ActivePlayerState>) => {
          const basePlayer = get().basePlayer;
          set({
            additionalPlayers: players,
            activePlayers: new Set([basePlayer, ...players]),
          });
        },
        setBasePlayer: (player: ActivePlayerState) => {
          const additionalPlayers = get().additionalPlayers;
          set({
            basePlayer: player,
            activePlayers: new Set([player, ...additionalPlayers]),
          });
        },
      }),
      {
        name: 'active-players-storage',
        partialize: (state) => ({ basePlayer: state.basePlayer }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Rebuild activePlayers from persisted basePlayer and additionalPlayers
            state.activePlayers = new Set([state.basePlayer, ...state.additionalPlayers]);
          }
        },
      }
    ),
    {
      name: 'active-players-store',
    }
  )
);

// Listen for gamepad connections to add new players
useGamepadStore.getState().gamepadEvents.on('gamepadconnected', ({ gamepad: gamepadInstance }) => {
  const { activePlayers } = useActivePlayersStore.getState();
  const newPlayer: ActivePlayerState = {
    id: activePlayers.size,
    name: `Player ${activePlayers.size + 1}`,
    controls: 'gamepad',
    gamepadIndex: gamepadInstance.gamepad.index,
  };
  useActivePlayersStore.setState({ activePlayers: new Set([...activePlayers, newPlayer]) });
});

// Listen for gamepad disconnections to remove players
useGamepadStore
  .getState()
  .gamepadEvents.on('gamepaddisconnected', ({ gamepad: gamepadInstance }) => {
    const { activePlayers } = useActivePlayersStore.getState();

    // Check if it's the base player's gamepad.
    // If so, just change their controls to keyboard instead of removing them
    const basePlayer = useActivePlayersStore.getState().basePlayer;
    if (
      basePlayer.controls === 'gamepad' &&
      basePlayer.gamepadIndex === gamepadInstance.gamepad.index
    ) {
      const updatedBasePlayer = {
        ...basePlayer,
        controls: 'keyboard' as const,
        gamepadIndex: undefined,
      };
      useActivePlayersStore.setState({ basePlayer: updatedBasePlayer });
      return;
    }

    const updatedPlayers = new Set(
      Array.from(activePlayers).filter(
        (player) => player.gamepadIndex !== gamepadInstance.gamepad.index
      )
    );
    useActivePlayersStore.setState({ activePlayers: updatedPlayers });
  });
