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
  enableAdditionalPlayers: boolean;
  basePlayer: ActivePlayerState;
  additionalPlayers: Set<ActivePlayerState>;
  activePlayers: Set<ActivePlayerState>;
  getUnoccupiedGamepads: () => Set<GamepadInstance>;
  getKeyboardPlayers: () => Set<ActivePlayerState>;
  setEnableAdditionalPlayers: (enabled: boolean) => void;
  setAdditionalPlayers: (players: Set<ActivePlayerState>) => void;
  setBasePlayer: (player: ActivePlayerState) => void;
  changePlayerControls: (
    playerId: number,
    controls: 'keyboard' | 'gamepad',
    gamepadIndex?: number
  ) => void;
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
        enableAdditionalPlayers: false,
        basePlayer: initialBasePlayer,
        additionalPlayers: new Set(),
        activePlayers: new Set([initialBasePlayer]),

        getKeyboardPlayers: () => {
          const { activePlayers } = get();
          return new Set(
            Array.from(activePlayers).filter((player) => player.controls === 'keyboard')
          );
        },

        getUnoccupiedGamepads: () => {
          const { connectedGamepads } = useGamepadStore.getState();
          const occupiedGamepadIndices = new Set(
            Array.from(get().activePlayers)
              .filter(
                (player) => player.controls === 'gamepad' && player.gamepadIndex !== undefined
              )
              .map((player) => player.gamepadIndex!)
          );

          return new Set(
            Array.from(connectedGamepads.values()).filter(
              (gamepad) => !occupiedGamepadIndices.has(gamepad.gamepad.index)
            )
          );
        },

        setEnableAdditionalPlayers: (enabled: boolean) => set({ enableAdditionalPlayers: enabled }),

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

        changePlayerControls: (playerId, controls, gamepadIndex) => {
          const { basePlayer, additionalPlayers, activePlayers } = get();
          let updatedBasePlayer = basePlayer;
          const updatedAdditionalPlayers = new Set<ActivePlayerState>();

          if (basePlayer.id === playerId) {
            updatedBasePlayer = { ...basePlayer, controls, gamepadIndex };
          } else {
            additionalPlayers.forEach((player) => {
              if (player.id === playerId) {
                updatedAdditionalPlayers.add({ ...player, controls, gamepadIndex });
              } else {
                updatedAdditionalPlayers.add(player);
              }
            });
          }

          // If changing from keyboard to gamepad, ensure no other player has the same gamepad index
          if (controls === 'gamepad' && gamepadIndex !== undefined) {
            const duplicatePlayer = Array.from(activePlayers).find(
              (player) => player.gamepadIndex === gamepadIndex && player.id !== playerId
            );

            if (duplicatePlayer) {
              // If duplicate found, set their controls to keyboard
              if (duplicatePlayer.id === basePlayer.id) {
                updatedBasePlayer = {
                  ...basePlayer,
                  controls: 'keyboard',
                  gamepadIndex: undefined,
                };
              } else {
                updatedAdditionalPlayers.forEach((player) => {
                  if (player.id === duplicatePlayer.id) {
                    updatedAdditionalPlayers.delete(player);
                    updatedAdditionalPlayers.add({
                      ...player,
                      controls: 'keyboard',
                      gamepadIndex: undefined,
                    });
                  }
                });
              }
            }
          }

          set({
            basePlayer: updatedBasePlayer,
            additionalPlayers: updatedAdditionalPlayers,
            activePlayers: new Set([updatedBasePlayer, ...updatedAdditionalPlayers]),
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

// Listen for gamepad connections to add new players, or switch base player to gamepad controls
// if enableAdditionalPlayers is false and the base player doesn't already have gamepad controls.
useGamepadStore.getState().gamepadEvents.on('gamepadconnected', ({ gamepad: gamepadInstance }) => {
  const { activePlayers, enableAdditionalPlayers, basePlayer } = useActivePlayersStore.getState();

  if (!enableAdditionalPlayers) {
    // If base player doesn't have gamepad controls, switch them to the new gamepad
    if (basePlayer.controls !== 'gamepad') {
      const updatedBasePlayer = {
        ...basePlayer,
        controls: 'gamepad' as const,
        gamepadIndex: gamepadInstance.gamepad.index,
      };
      useActivePlayersStore.setState({ basePlayer: updatedBasePlayer });
    }
    return;
  }

  const newPlayer: ActivePlayerState = {
    id: activePlayers.size,
    name: `Player ${activePlayers.size + 1}`,
    controls: 'gamepad',
    gamepadIndex: gamepadInstance.gamepad.index,
  };
  useActivePlayersStore.setState({ activePlayers: new Set([...activePlayers, newPlayer]) });
});

// Listen for gamepad disconnections to remove players or switch to keyboard controls
// if it's the base player.
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
