export const FMOD_EVENTS = {
  MUSIC_SYSTEM: 'event:/Music/Music System',
  HURT: 'event:/SFX/Take Damage',
  ATTACK: 'event:/SFX/Attack',
};

export const MESSAGES = {
  SYSTEM_SETUP_FAILED: '[FMOD] System setup failed',
  MODULE_FACTORY_FAILED: '[FMOD] Module factory failed',
  SYSTEM_NOT_INITIALIZED: '[FMOD] System not initialized',
  EVENT_NOT_FOUND: '[FMOD] Event not found',
  EVENT_PATHS_LABEL: '[FMOD] Event Paths',
  LOADED_BANK: (bankName: string) => `[FMOD] Loaded bank "${bankName}"`,
  WASM_FETCH_FAILED: (error: unknown) => `[FMOD] Failed to fetch fmodstudio.wasm: ${error}`,
};
