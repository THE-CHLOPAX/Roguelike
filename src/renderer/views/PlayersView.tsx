import { useEffect } from 'react';
import { InternalFlex, InternalText } from '@tgdf';

import { BackToViewLayout } from '../layouts/BackToViewLayout';
import { useActivePlayersStore } from '../store/useActivePlayersStore';

export function PlayersView() {
  const { activePlayers } = useActivePlayersStore();

  //debug:
  useEffect(() => {
    console.log('Active players:', activePlayers);
  }, [activePlayers]);

  return (
    <BackToViewLayout backToView="menu">
      <InternalFlex direction="column" justify="center" align="center" style={{ height: '100vh' }}>
        <InternalText size="xl" weight="bold">
          Players View
        </InternalText>

        {Array.from(activePlayers).map((player) => (
          <InternalText key={player.id} size="lg">
            Player ID: {player.id}, Name: {player.name}, Controls: {player.controls}
          </InternalText>
        ))}
      </InternalFlex>
    </BackToViewLayout>
  );
}
