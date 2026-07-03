import type {
  FMODCoreSystem,
  FMODEventInstance,
  FMODEventDescription,
  FMODObject,
  FMODOutVal,
  FMODBank,
  FMODStudioSystem,
} from './fmodstudio';

import { assert, logger, useSoundsStore } from '@tgdf';

import { MESSAGES } from './constants';
import { fmodOut } from './utils/fmodOut';
import FMODModuleFactory from './fmodstudio';
import { fmodCheckOrThrow } from './utils/fmodCheckOrThrow';

export type FMODPlayEventOptions = {
  playbackRate?: number;
  volume?: number;
  parameters?: Record<string, number>;
};

export type FMODPlayEventInChannelOptions = {
  playbackRate?: number;
  parameters?: Record<string, number>;
};

export type FMODPrivateFieldOverrides = {
  fmod: Partial<FMODObject>;
  system: Partial<FMODStudioSystem>;
  banks: Partial<FMODBank>[];
  initialized: boolean;
  initPromise: Promise<boolean>;
  updateInterval: ReturnType<typeof setInterval>;
  channelSubscriptions: Map<FMODEventInstance, () => void>;
};

export class FMODAudio {
  public static getInstance(privateFieldOverrides?: Partial<FMODPrivateFieldOverrides>): FMODAudio {
    if (!FMODAudio._instance) {
      FMODAudio._instance = new FMODAudio(privateFieldOverrides);
    }
    return FMODAudio._instance;
  }

  private static _instance: FMODAudio | null = null;

  private _fmod = {} as FMODObject;
  private _system: FMODStudioSystem | null = null;
  private _banks: FMODBank[] = [];
  private _initialized = false;
  private _initPromise: Promise<boolean> | null = null;
  private _updateInterval: ReturnType<typeof setInterval> | null = null;
  private _channelSubscriptions = new Map<FMODEventInstance, () => void>();

  constructor(privateFieldOverrides?: Partial<FMODPrivateFieldOverrides>) {
    if (!privateFieldOverrides) return;
    const { fmod, system, banks, initialized, initPromise, updateInterval, channelSubscriptions } =
      privateFieldOverrides;
    if (fmod !== undefined) this._fmod = fmod as FMODObject;
    if (system !== undefined) this._system = system as FMODStudioSystem;
    if (banks !== undefined) this._banks = banks as FMODBank[];
    if (initialized !== undefined) this._initialized = initialized;
    if (initPromise !== undefined) this._initPromise = initPromise;
    if (updateInterval !== undefined) this._updateInterval = updateInterval;
    if (channelSubscriptions !== undefined) this._channelSubscriptions = channelSubscriptions;
  }

  /**
   * Loads and initialises the FMOD Studio Emscripten runtime.
   * Resolves true on success, false if anything goes wrong.
   * Safe to call multiple times — subsequent calls return true immediately.
   */
  public init(wasmBinary: Uint8Array): Promise<boolean> {
    if (this._initialized) return Promise.resolve(true);
    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise<boolean>((resolve) => {
      this._fmod.wasmBinary = wasmBinary;
      this._fmod.INITIAL_MEMORY = 64 * 1024 * 1024;

      this._fmod.onRuntimeInitialized = () => {
        try {
          this._setupSystem();
          this._initialized = true;
          this._updateInterval = setInterval(() => this._system?.update(), 20);
          resolve(true);
        } catch (_e) {
          logger({ message: MESSAGES.SYSTEM_SETUP_FAILED, type: 'error' });
          resolve(false);
        }
      };

      try {
        FMODModuleFactory(this._fmod);
      } catch (_e) {
        logger({ message: MESSAGES.MODULE_FACTORY_FAILED, type: 'error' });
        resolve(false);
      }
    });

    return this._initPromise;
  }

  /**
   * Fetches a bank file from the given URL, mounts it into FMOD's virtual FS
   * and loads it into the Studio system.
   * Must be called after init() has resolved true.
   */
  public async loadBank(url: string): Promise<void> {
    if (!this._initialized || this._system === null) {
      throw new Error('[FMOD] System not initialized');
    }
    const bankName = url.split('/').pop() ?? url;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `[FMOD] Failed to fetch bank "${url}": ${response.status} ${response.statusText}`
      );
    }

    const data = new Uint8Array(await response.arrayBuffer());

    this._fmod.FS_createDataFile('/', bankName, data, true, false);

    const bankOut = fmodOut<FMODBank>();
    fmodCheckOrThrow(
      this._fmod,
      this._system.loadBankFile(`/${bankName}`, this._fmod.STUDIO_LOAD_BANK_NORMAL, bankOut)
    );
    assert(bankOut.val !== undefined, '[FMOD] Bank not loaded');
    logger({ message: MESSAGES.LOADED_BANK(bankName), type: 'info' });
    this._banks.push(bankOut.val);
  }

  /**
   * Starts an FMOD Studio event and returns the instance.
   * For looping or stoppable events, hold the reference and pass it to stopEvent().
   * For true one-shots that need no manual cleanup, set release parameter to true.
   * @param eventPath The path of the event to play.
   * @param release Whether to release the event instance after playing.
   * @returns The event instance.
   */
  public playEvent({
    eventPath,
    options,
  }: {
    eventPath: string;
    options?: FMODPlayEventOptions;
  }): FMODEventInstance | null {
    if (!this._initialized || this._system === null) {
      logger({ message: MESSAGES.SYSTEM_NOT_INITIALIZED, type: 'error' });
      return null;
    }

    const descOut = fmodOut<FMODEventDescription>();
    fmodCheckOrThrow(this._fmod, this._system.getEvent(eventPath, descOut));
    assert(descOut.val !== undefined);

    const instanceOut = fmodOut<FMODEventInstance>();
    fmodCheckOrThrow(this._fmod, descOut.val.createInstance(instanceOut));
    assert(instanceOut.val !== undefined);

    fmodCheckOrThrow(this._fmod, instanceOut.val.start());
    fmodCheckOrThrow(this._fmod, instanceOut.val.release());

    if (options?.playbackRate) {
      fmodCheckOrThrow(this._fmod, instanceOut.val.setPitch(options.playbackRate));
    }
    if (options?.volume) {
      fmodCheckOrThrow(this._fmod, instanceOut.val.setVolume(options.volume));
    }
    if (options?.parameters) {
      for (const [name, value] of Object.entries(options.parameters)) {
        fmodCheckOrThrow(this._fmod, instanceOut.val.setParameterByName(name, value, false));
      }
    }
    return instanceOut.val;
  }

  /**
   * Plays an event and ties its volume and mute state to a sound channel from
   * useSoundsStore. Future setChannelVolume / setChannelMuted calls automatically
   * propagate to the FMOD instance. The subscription is cleaned up on stopEvent().
   */
  public playEventInSoundChannel({
    eventPath,
    channelId,
    options,
  }: {
    eventPath: string;
    channelId: string;
    options?: FMODPlayEventInChannelOptions;
  }): FMODEventInstance | null {
    const instance = this.playEvent({ eventPath, options });

    if (instance === null) {
      logger({ message: MESSAGES.EVENT_NOT_FOUND, type: 'error' });
      return null;
    }

    const applyChannel = () => {
      const channel = useSoundsStore.getState().soundChannels.get(channelId);
      if (channel) {
        if (channel.muted) {
          instance.setVolume(0);
        } else {
          instance.setVolume(channel.volume);
        }
      }
    };

    applyChannel();

    // Subscribe to the store — soundChannels is replaced with a new Map on every
    // setChannelVolume / setChannelMuted call, so each update triggers this.
    const unsubscribe = useSoundsStore.subscribe(applyChannel);

    this._channelSubscriptions.set(instance, unsubscribe);
    return instance;
  }

  /**
   * Stops a playing event instance and releases it.
   * @param instance  The value returned by playEvent().
   * @param allowFadeout  When true, lets the event tail/fadeout play before stopping.
   *                      Defaults to false (immediate cut).
   */
  public stopEvent(instance: FMODEventInstance, allowFadeout = false): void {
    this._cleanupChannelSubscription(instance);

    const mode = allowFadeout
      ? this._fmod.STUDIO_STOP_ALLOWFADEOUT
      : this._fmod.STUDIO_STOP_IMMEDIATE;

    // The handle may already be invalid if the event finished before stopEvent() was called.
    if (instance.stop(mode) === this._fmod.OK) {
      instance.release();
    }
  }

  /**
   * Resumes the Web Audio context after the first user gesture.
   * Browsers suspend audio until the user interacts — call this inside any
   * click or keydown handler if sounds aren't playing after init.
   */
  public resumeAudio(): void {
    this._fmod.OutputWebAudio_resumeAudio?.();
    this._fmod.OutputAudioWorklet_resumeAudio?.();
  }

  /**
   * Drives the FMOD Studio update loop.
   * The internal setInterval already calls this every 20 ms — only use this
   * method if you want to tick FMOD in sync with your own render loop instead.
   */
  public update(): void {
    this._system?.update();
  }

  public logEventPaths(): void {
    const eventPaths: string[] = [];

    for (const bank of this._banks) {
      const countOut = fmodOut<number>();
      fmodCheckOrThrow(this._fmod, bank.getEventCount(countOut));
      assert(countOut.val !== undefined, '[FMOD] Event count not found');

      const listOut = fmodOut<FMODEventDescription[]>();
      fmodCheckOrThrow(
        this._fmod,
        bank.getEventList(listOut, countOut.val, {} as FMODOutVal<number>)
      );
      assert(listOut.val !== undefined, '[FMOD] Event list not found');

      for (const desc of listOut.val) {
        const pathOut = fmodOut<string>();
        fmodCheckOrThrow(this._fmod, desc.getPath(pathOut, 256, null));
        assert(pathOut.val !== undefined, '[FMOD] Event path not found');
        eventPaths.push(pathOut.val);
      }
    }

    logger({
      group: { label: MESSAGES.EVENT_PATHS_LABEL, body: eventPaths.join('\n') },
      type: 'info',
    });
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private _setupSystem(): void {
    const studioOut = fmodOut<FMODStudioSystem>();
    fmodCheckOrThrow(this._fmod, this._fmod.Studio_System_Create(studioOut));
    assert(studioOut.val !== undefined, '[FMOD] System not created');
    this._system = studioOut.val;

    const coreOut = fmodOut<FMODCoreSystem>();
    fmodCheckOrThrow(this._fmod, this._system.getCoreSystem(coreOut));
    assert(coreOut.val !== undefined, '[FMOD] Core system not found');
    const coreSystem = coreOut.val;

    const driverOut = fmodOut<number>();

    // Reduce audio latency — 2048 samples is safe for WebAudio (non-AudioWorklet) paths.
    fmodCheckOrThrow(this._fmod, coreSystem.setDSPBufferSize(2048, 2));

    // Match the mixer sample rate to the OS output rate to avoid unnecessary resampling.
    fmodCheckOrThrow(this._fmod, coreSystem.getDriverInfo(0, null, null, driverOut, null, null));
    assert(driverOut.val !== undefined, '[FMOD] Driver not found');

    fmodCheckOrThrow(
      this._fmod,
      coreSystem.setSoftwareFormat(driverOut.val, this._fmod.SPEAKERMODE_DEFAULT, 0)
    );

    fmodCheckOrThrow(
      this._fmod,
      this._system.initialize(1024, this._fmod.STUDIO_INIT_NORMAL, this._fmod.INIT_NORMAL, null)
    );
  }

  private _cleanupChannelSubscription(instance: FMODEventInstance): void {
    const unsubscribe = this._channelSubscriptions.get(instance);
    if (unsubscribe === undefined) return;
    unsubscribe();
    this._channelSubscriptions.delete(instance);
  }
}
