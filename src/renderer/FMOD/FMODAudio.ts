import type {
  FMODCoreSystem,
  FMODEventInstance,
  FMODEventDescription,
  FMODObject,
  FMODOutVal,
  FMODBank,
  FMODStudioSystem,
} from './fmodstudio';

import { logger } from '@tgdf';

import FMODModuleFactory from './fmodstudio';

export class FMODAudio {
  public static getInstance(): FMODAudio {
    if (!FMODAudio._instance) {
      FMODAudio._instance = new FMODAudio();
    }
    return FMODAudio._instance;
  }

  private static _instance: FMODAudio | null = null;

  private _fmod = {} as FMODObject;
  private _system: FMODStudioSystem | null = null;
  private _banks: FMODBank[] = [];
  private _initialized = false;
  private _updateInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Loads and initialises the FMOD Studio Emscripten runtime.
   * Resolves true on success, false if anything goes wrong.
   * Safe to call multiple times — subsequent calls return true immediately.
   */
  async init(): Promise<boolean> {
    if (this._initialized) return true;

    // Pre-fetch the wasm binary and hand it to Emscripten directly via wasmBinary.
    // This bypasses Emscripten's __filename/__dirname path resolution which breaks
    // in Electron's renderer process (webpack shims __dirname to the Electron
    // resources path, causing it to look inside electron.asar).
    let wasmBinary: Uint8Array;
    try {
      const response = await fetch('./fmodstudio.wasm');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      wasmBinary = new Uint8Array(await response.arrayBuffer());
    } catch (e) {
      logger({ message: `[FMOD] Failed to fetch fmodstudio.wasm: ${e}`, type: 'error' });
      return false;
    }

    return new Promise<boolean>((resolve) => {
      this._fmod.wasmBinary = wasmBinary;
      this._fmod.INITIAL_MEMORY = 64 * 1024 * 1024;

      this._fmod.onRuntimeInitialized = () => {
        try {
          this._setupSystem();
          this._initialized = true;
          this._updateInterval = setInterval(() => this._system?.update(), 20);
          resolve(true);
        } catch (e) {
          logger({ message: `[FMOD] System setup failed: ${e}`, type: 'error' });
          resolve(false);
        }
      };

      try {
        FMODModuleFactory(this._fmod);
      } catch (e) {
        logger({ message: `[FMOD] Module factory failed: ${e}`, type: 'error' });
        resolve(false);
      }
    });
  }

  /**
   * Fetches a bank file from the given URL, mounts it into FMOD's virtual FS
   * and loads it into the Studio system.
   * Must be called after init() has resolved true.
   */
  async loadBank(url: string): Promise<void> {
    const bankName = url.split('/').pop() ?? url;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `[FMOD] Failed to fetch bank "${url}": ${response.status} ${response.statusText}`
      );
    }

    const data = new Uint8Array(await response.arrayBuffer());

    this._fmod.FS_createDataFile('/', bankName, data, true, false);

    const bankOut = {} as FMODOutVal<FMODBank>;
    this._check(
      this._system!.loadBankFile(`/${bankName}`, this._fmod.STUDIO_LOAD_BANK_NORMAL, bankOut)
    );
    logger({ message: `[FMOD] Loaded bank "${bankName}"`, type: 'info' });
    this._banks.push(bankOut.val);
  }

  /**
   * Triggers a one-shot FMOD Studio event by its path (e.g. "event:/SFX/Explosion").
   * The instance is released immediately after starting so FMOD cleans it up on completion.
   */
  playEvent(eventPath: string): void {
    const descOut = {} as FMODOutVal<FMODEventDescription>;
    this._check(this._system!.getEvent(eventPath, descOut));

    const instanceOut = {} as FMODOutVal<FMODEventInstance>;
    this._check(descOut.val.createInstance(instanceOut));
    this._check(instanceOut.val.start());
    this._check(instanceOut.val.release());
  }

  /**
   * Resumes the Web Audio context after the first user gesture.
   * Browsers suspend audio until the user interacts — call this inside any
   * click or keydown handler if sounds aren't playing after init.
   */
  resumeAudio(): void {
    this._fmod.OutputWebAudio_resumeAudio?.();
    this._fmod.OutputAudioWorklet_resumeAudio?.();
  }

  /**
   * Drives the FMOD Studio update loop.
   * The internal setInterval already calls this every 20 ms — only use this
   * method if you want to tick FMOD in sync with your own render loop instead.
   */
  update(): void {
    this._system?.update();
  }

  logEventPaths(): void {
    const eventPaths: string[] = [];

    for (const bank of this._banks) {
      const countOut = {} as FMODOutVal<number>;
      bank.getEventCount(countOut);

      const listOut = {} as FMODOutVal<FMODEventDescription[]>;
      bank.getEventList(listOut, countOut.val, {} as FMODOutVal<number>);

      for (const desc of listOut.val) {
        const pathOut = {} as FMODOutVal<string>;
        desc.getPath(pathOut, 256, null);
        eventPaths.push(pathOut.val);
      }
    }

    logger({ group: { label: '[FMOD] Event Paths', body: eventPaths.join('\n') }, type: 'info' });
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private _setupSystem(): void {
    const studioOut = {} as FMODOutVal<FMODStudioSystem>;
    this._check(this._fmod.Studio_System_Create(studioOut));
    this._system = studioOut.val;

    const coreOut = {} as FMODOutVal<FMODCoreSystem>;
    this._check(this._system.getCoreSystem(coreOut));
    const coreSystem = coreOut.val;

    const driverOut = {} as FMODOutVal<number>;

    // Reduce audio latency — 2048 samples is safe for WebAudio (non-AudioWorklet) paths.
    this._check(coreSystem.setDSPBufferSize(2048, 2));

    // Match the mixer sample rate to the OS output rate to avoid unnecessary resampling.
    this._check(coreSystem.getDriverInfo(0, null, null, driverOut, null, null));
    this._check(coreSystem.setSoftwareFormat(driverOut.val, this._fmod.SPEAKERMODE_DEFAULT, 0));

    this._check(
      this._system.initialize(1024, this._fmod.STUDIO_INIT_NORMAL, this._fmod.INIT_NORMAL, null)
    );
  }

  private _check(result: number): void {
    if (result !== this._fmod.OK) {
      throw new Error(`[FMOD] ${this._fmod.ErrorString(result)}`);
    }
  }
}
