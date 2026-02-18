import { useCallback, useEffect, useMemo } from 'react';
import {
  InternalFlex,
  InternalText,
  InternalSelect,
  InternalButton,
  InternalCheckbox,
} from '@tgdf';

import { BackToViewLayout } from '../layouts/BackToViewLayout';
import { ActivePlayerState, useActivePlayersStore } from '../store/useActivePlayersStore';

export function PlayersView() {
  const {
    basePlayer,
    additionalPlayers,
    activePlayers,
    enableAdditionalPlayers,
    setEnableAdditionalPlayers,
    setAdditionalPlayers,
    changePlayerControls,
    getKeyboardPlayers,
    getUnoccupiedGamepads,
  } = useActivePlayersStore();

  //debug:
  useEffect(() => {
    console.log('Active players:', activePlayers);
  }, [activePlayers]);

  useEffect(() => {
    console.log('Keyboard players:', getKeyboardPlayers());
    console.log('Unoccupied gamepads:', getUnoccupiedGamepads());
  }, [getKeyboardPlayers(), getUnoccupiedGamepads()]);

  const handleRemovePlayer = (playerId: number) => {
    console.log('Removing player with ID:', playerId);
    setAdditionalPlayers(
      new Set(Array.from(additionalPlayers).filter((player) => player.id !== playerId))
    );
  };

  const getAvailableControls = useCallback(
    (playerControls: ActivePlayerState['controls']) => [
      {
        label: 'Keyboard',
        value: 'keyboard' as const,
        disabled: getKeyboardPlayers().size >= 1 && playerControls !== 'keyboard',
      },
      {
        label: 'Gamepad',
        value: 'gamepad' as const,
        disabled: getUnoccupiedGamepads().size === 0 && playerControls !== 'gamepad',
      },
    ],
    [getKeyboardPlayers(), getUnoccupiedGamepads()]
  );

  return (
    <BackToViewLayout backToView="menu">
      <InternalFlex
        direction="column"
        justify="center"
        align="center"
        style={{ height: '100vh', color: '#fff' }}
      >
        <InternalText size="xl" weight="bold">
          Players View
        </InternalText>

        {Array.from(activePlayers).map((player) => (
          <InternalFlex
            key={player.id}
            direction="row"
            justify="between"
            gap={'1rem'}
            style={{ marginTop: '1rem', border: '1px solid #fff', padding: '5px' }}
          >
            <InternalText size="lg">{player.id}</InternalText>
            <InternalText size="lg">{player.name}</InternalText>
            <InternalText size="lg">
              Controls:
              <InternalSelect
                value={player.controls}
                options={getAvailableControls(player.controls)}
                onChange={(value) => {
                  const gamepadIndex =
                    value === 'gamepad'
                      ? getUnoccupiedGamepads().values().next().value?.gamepad.index
                      : undefined;
                  changePlayerControls(player.id, value, gamepadIndex);
                }}
              />
            </InternalText>
            {player.id !== basePlayer.id && (
              <InternalButton onClick={() => handleRemovePlayer(player.id)} label={'X'} />
            )}
          </InternalFlex>
        ))}

        <InternalFlex>
          <InternalText>Enable Additional Players</InternalText>
          <InternalCheckbox
            checked={enableAdditionalPlayers}
            onChange={(checked) => setEnableAdditionalPlayers(checked)}
          />
        </InternalFlex>
      </InternalFlex>
    </BackToViewLayout>
  );
}
