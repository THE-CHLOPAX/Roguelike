import { useViewsStore, InternalButton, InternalFlex, ipc } from '@tgdf';

import * as views from '../views';
import { COLORS } from '../../constants';

export function MenuView() {
  const { setView } = useViewsStore();

  return (
    <InternalFlex
      direction="column"
      align="center"
      justify="center"
      style={{ height: '100vh', gap: '20px', backgroundColor: COLORS.BG_COLOR }}
    >
      <InternalFlex direction="column" align="center" gap={10}>
        {Object.keys(views).map((viewName) => {
          if (viewName === 'MenuView') return null; // Skip the menu view

          return (
            <InternalButton key={viewName} label={viewName} onClick={() => setView(viewName)} />
          );
        })}

        <InternalButton
          label="Quit"
          onClick={() => {
            ipc.send('app-quit-request', undefined);
          }}
        />
      </InternalFlex>
    </InternalFlex>
  );
}
