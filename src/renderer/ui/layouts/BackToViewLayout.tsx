import { InternalButton, useKeyPress, useViewsStore } from '@tgdf';

import * as views from '../views';

export type BackToViewLayoutProps = {
  backToView: keyof typeof views;
  children: React.ReactNode;
};

export function BackToViewLayout({ backToView, children }: BackToViewLayoutProps) {
  const { setView } = useViewsStore();

  // Listen for Escape key to go back
  useKeyPress('Escape', () => {
    setView(backToView);
  });

  return (
    <>
      <InternalButton
        label="Back"
        onClick={() => setView(backToView)}
        style={{ position: 'absolute', top: '10px', left: '10px' }}
      />
      {children}
    </>
  );
}
