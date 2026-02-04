import { Resolution } from './graphics';

export type NativeEventMainMap = {
  'set-resolution-response': { resolution: Resolution };
  'set-fullscreen-response': { fullscreen: boolean };
  'get-fullscreen-state-response': { fullscreen: boolean };
};

export type NativeEventRendererMap = {
  'app-quit-request': undefined;
  'set-resolution-request': { resolution: Resolution };
  'set-fullscreen-request': { fullscreen: boolean; resolution: Resolution };
  'get-fullscreen-state-request': undefined;
};
