import { useEffect } from 'react';
import { InternalButton, useInput, useViewsStore } from '@tgdf';

import * as views from '../ui/views';

export type BackToViewLayoutProps = {
  backToView: keyof typeof views;
  children: React.ReactNode;
};

export function BackToViewLayout({ backToView, children }: BackToViewLayoutProps) {
  const input = useInput();

  useEffect(() => {
    const cleanup = input.addKeyDownListener('Escape', () => {
      setView(backToView);
    });
    return cleanup;
  }, [backToView]);

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
