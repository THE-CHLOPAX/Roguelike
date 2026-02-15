import '@radix-ui/themes/styles.css';
import '@tgdf/internal-ui/global.css';
import React from 'react';
import { ViewManager } from '@tgdf';
import { Theme } from '@radix-ui/themes';

import { MenuView } from './views/MenuView';
import { SettingsView } from './views/SettingsView';
import { ControlsTestView } from './views/ControlsTestView';

const App: React.FC = () => {
  return (
    <Theme>
      <ViewManager
        views={{
          menu: MenuView,
          settings: SettingsView,
          controlsTest: ControlsTestView,
        }}
      />
    </Theme>
  );
};

export default App;
