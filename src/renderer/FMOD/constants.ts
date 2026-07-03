export const FMOD_EVENTS = {
  MUSIC_SYSTEM: 'event:/Music/Music System',
  HURT: 'event:/SFX/Take Damage',
  ATTACK: 'event:/SFX/Attack',
};

export const MESSAGES = {
  SYSTEM_SETUP_FAILED: '[FMOD] System setup failed',
  HOOK_INITIALIZATION_FAILED: '[FMOD] Failed to initialize FMOD Audio',
  MODULE_FACTORY_FAILED: '[FMOD] Module factory failed',
  SYSTEM_NOT_INITIALIZED: '[FMOD] System not initialized',
  SYSTEM_NOT_CREATED: '[FMOD] System not created',
  CORE_SYSTEM_NOT_FOUND: '[FMOD] Core system not found',
  DRIVER_NOT_FOUND: '[FMOD] Driver not found',
  EVENT_NOT_FOUND: '[FMOD] Event not found',
  EVENT_INSTANCE_NOT_CREATED: '[FMOD] Event instance not created',
  EVENT_SOUND_CHANNEL_SUBSCRIPTION_CLEARED: '[FMOD] Event sound channel subscription cleared',
  EVENT_COUNT_NOT_FOUND: '[FMOD] Event count not found',
  EVENT_LIST_NOT_FOUND: '[FMOD] Event list not found',
  EVENT_PATH_NOT_FOUND: '[FMOD] Event path not found',
  EVENT_PATHS_LABEL: '[FMOD] Event Paths',
  BANK_NOT_LOADED: '[FMOD] Bank not loaded',
  BANK_LOAD_FAILED: (url: string, error: unknown) =>
    `[FMOD] Failed to load bank "${url}": ${error}`,
  BANK_ALREADY_LOADED: (bankName: string) => `[FMOD] Bank "${bankName}" already loaded`,
  BANK_ALREADY_LOADING: (bankName: string) => `[FMOD] Bank "${bankName}" already loading`,
  BANK_FETCH_FAILED: (url: string, status: number, statusText: string) =>
    `[FMOD] Failed to fetch bank "${url}": ${status} ${statusText}`,
  LOADED_BANK: (bankName: string) => `[FMOD] Loaded bank "${bankName}"`,
  WASM_FETCH_FAILED: (error: unknown) => `[FMOD] Failed to fetch fmodstudio.wasm: ${error}`,
  API_ERROR: (detail: string) => `[FMOD] ${detail}`,
};
