import '@radix-ui/themes/styles.css';
import '@tgdf/internal-ui/global.css';
import React from 'react';
import styled from 'styled-components';
import { Theme } from '@radix-ui/themes';
import { InternalFlex, InternalText, useGamepadStore, ViewManager } from '@tgdf';

import * as views from './ui/views';
import { useFMODAudioInitialization } from './FMOD';
import { useActivePlayersStore } from './store/useActivePlayersStore';

const App: React.FC = () => {
  useGamepadStore();
  useActivePlayersStore();

  const { isReady } = useFMODAudioInitialization({
    preloadBankUrls: [
      '/assets/sounds/banks/Master.bank',
      '/assets/sounds/banks/Master.strings.bank',
    ],
  });

  return (
    <Theme>
      {isReady ? (
        <ViewManager views={views} />
      ) : (
        <StyledInternalFlex justify="center" align="center">
          <InternalText color="white">Loading...</InternalText>
        </StyledInternalFlex>
      )}
    </Theme>
  );
};

const StyledInternalFlex = styled(InternalFlex)`
  width: 100vw;
  height: 100vh;
  background-color: #000;
`;

export default App;
