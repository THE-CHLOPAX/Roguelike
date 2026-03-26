import { useEffect } from 'react';
import { InternalButton, useKeyboard, useViewsStore } from '@tgdf';

import * as views from '../ui/views';

export type BackToViewLayoutProps = {
  backToView: keyof typeof views;
  children: React.ReactNode;
};

export function BackToViewLayout({ backToView, children }: BackToViewLayoutProps) {
  const { addKeyDownListener } = useKeyboard();

  useEffect(() => {
    addKeyDownListener('Escape', () => {
      setView(backToView);
    });
  }, []);

  const { setView } = useViewsStore();

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
