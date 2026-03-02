import { KeyboardInput } from '@tgdf';

import { BaseControls, BaseControlsOptions } from './BaseControls';

export type WSADControlsOptions = BaseControlsOptions & {
  keyboardInput: KeyboardInput;
};

export class WSADControls extends BaseControls {
  private _keyboardInput: KeyboardInput;

  constructor({ gameObject, camera, keyboardInput, cameraLerp }: WSADControlsOptions) {
    super({ gameObject, camera, cameraLerp });

    this._keyboardInput = keyboardInput;

    this._handleKeyboardInput();
  }

  private _handleKeyboardInput(): void {
    const keyMappings = [
      { key: 'w', axis: 'z' as const, value: -1 },
      { key: 'a', axis: 'x' as const, value: -1 },
      { key: 's', axis: 'z' as const, value: 1 },
      { key: 'd', axis: 'x' as const, value: 1 },
    ];

    this._keyboardInput.addKeyDownListener('shift', () => {
      this.toggleSprint(true);
    });

    this._keyboardInput.addKeyUpListener('shift', () => {
      this.toggleSprint(false);
    });

    for (const { key, axis, value } of keyMappings) {
      this._keyboardInput.addKeyPressListener(
        key,
        () => {
          this.direction[axis] = value;
        },
        10
      );
      this._keyboardInput.addKeyUpListener(key, () => {
        this.direction[axis] = 0;
      });
    }
  }
}
