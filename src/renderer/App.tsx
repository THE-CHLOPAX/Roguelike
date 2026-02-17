import '@radix-ui/themes/styles.css';
import '@tgdf/internal-ui/global.css';
import React from 'react';
import { Theme } from '@radix-ui/themes';
import { useGamepadStore, ViewManager } from '@tgdf';

import { MenuView } from './views/MenuView';
import { PlayersView } from './views/PlayersView';
import { SettingsView } from './views/SettingsView';
import { ControlsTestView } from './views/ControlsTestView';
import { useActivePlayersStore } from './store/useActivePlayersStore';

export const views = {
  menu: MenuView,
  settings: SettingsView,
  controlsTest: ControlsTestView,
  playersView: PlayersView,
};

const App: React.FC = () => {
  useGamepadStore();
  useActivePlayersStore();

  return (
    <Theme>
      <ViewManager views={views} />
    </Theme>
  );
};

export default App;
