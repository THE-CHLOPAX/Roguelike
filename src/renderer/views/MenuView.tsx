import { useViewsStore, InternalButton, InternalFlex, InternalText, ipc } from '@tgdf';

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
        <InternalButton label="Play" onClick={() => setView('test')} />

        <InternalButton label="Settings" onClick={() => setView('settings')} />

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
