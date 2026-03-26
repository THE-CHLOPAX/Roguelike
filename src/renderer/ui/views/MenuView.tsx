import { useViewsStore, InternalButton, InternalFlex, InternalText, ipc } from '@tgdf';

import { views } from '../../App';

export function MenuView() {
  const { setView } = useViewsStore();

  return (
    <InternalFlex
      direction="column"
      align="center"
      justify="center"
      style={{ height: '100vh', gap: '20px', backgroundColor: '#000' }}
    >
      <img src={'./assets/icon.png'} alt="TGDF Logo" width={200} height={200}></img>

      <InternalText size="xl" weight="bold" color="#fff">
        TGDF Template
      </InternalText>

      <InternalFlex direction="column" align="center" gap={10}>
        {Object.keys(views).map((viewName) => {
          if (viewName === 'menu') return null; // Skip the menu view

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
