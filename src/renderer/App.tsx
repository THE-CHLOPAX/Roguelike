import '@radix-ui/themes/styles.css';
import '@tgdf/internal-ui/global.css';
import React from 'react';
import { Theme } from '@radix-ui/themes';
import { useGamepadStore, ViewManager } from '@tgdf';

import * as views from './ui/views';
import { useActivePlayersStore } from './store/useActivePlayersStore';
import { useFMODAudioInitialization } from './FMOD/hooks/useFMODAudioInitialization';

const App: React.FC = () => {
  useGamepadStore();
  useActivePlayersStore();

  useFMODAudioInitialization({
    bankUrls: ['/assets/sounds/banks/Master.bank', '/assets/sounds/banks/Master.strings.bank'],
  });

  return (
    <Theme>
      <ViewManager views={views} />
    </Theme>
  );
};

export default App;
