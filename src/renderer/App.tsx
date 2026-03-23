import '@radix-ui/themes/styles.css';
import '@tgdf/internal-ui/global.css';
import React from 'react';
import { Theme } from '@radix-ui/themes';
import { useGamepadStore, ViewManager } from '@tgdf';

import { MenuView } from './ui/views/MenuView';
import { PlayersView } from './ui/views/PlayersView';
import { SettingsView } from './ui/views/SettingsView';
import { useActivePlayersStore } from './store/useActivePlayersStore';
import { ModelRendererTestView } from './ui/views/ModelRendererTestView';

export const views = {
  menu: MenuView,
  settings: SettingsView,
  playersView: PlayersView,
  modelRendererTest: ModelRendererTestView,
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
