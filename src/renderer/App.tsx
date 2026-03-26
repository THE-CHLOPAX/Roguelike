import '@radix-ui/themes/styles.css';
import '@tgdf/internal-ui/global.css';
import React from 'react';
import { Theme } from '@radix-ui/themes';
import { useGamepadStore, ViewManager } from '@tgdf';

import { MenuView } from './ui/views/MenuView';
import { PlayersView } from './ui/views/PlayersView';
import { SettingsView } from './ui/views/SettingsView';
import { PathfindingTestView } from './ui/views/PathfindingTestView';
import { useActivePlayersStore } from './store/useActivePlayersStore';

export const views = {
  menu: MenuView,
  pathfindingTest: PathfindingTestView,
  settings: SettingsView,
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
