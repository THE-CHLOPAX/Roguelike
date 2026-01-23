import '@radix-ui/themes/styles.css';
import '@tgdf/internal-ui/global.css';
import React from 'react';
import { ViewManager } from '@tgdf';
import { Theme } from '@radix-ui/themes';

import { MenuView } from './views/MenuView';
import { TestView } from './views/TestView';
import { SettingsView } from './views/SettingsView';

const App: React.FC = () => {
  return (
    <Theme>
      <ViewManager
        views={{
          menu: MenuView,
          settings: SettingsView,
          test: TestView
        }}
      />
    </Theme>
  );
};

export default App;
