import type {
  FMODEventInstance,
  FMODEventDescription,
  FMODBank,
  FMODObject,
  FMODStudioSystem,
  FMODOutVal,
} from './fmodstudio';

import { Mock, It, Times } from 'moq.ts';
import { logger, useSoundsStore } from '@tgdf';
import { assert, describe, it, expect, vi, beforeEach } from 'vitest';

import { FMODAudio } from './FMODAudio';
import FMODModuleFactory from './fmodstudio';

vi.mock('./fmodstudio', () => ({ default: vi.fn() }));
vi.mock('@tgdf', () => ({
  logger: vi.fn(),
  assert,
  useSoundsStore: {
    getState: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

const OK = 0;

function buildInstanceMock() {
  const m = new Mock<FMODEventInstance>();
  m.setup((x) => x.start()).returns(OK);
  m.setup((x) => x.release()).returns(OK);
  m.setup((x) => x.stop(It.IsAny())).returns(OK);
  m.setup((x) => x.setVolume(It.IsAny())).returns(OK);
  m.setup((x) => x.setPitch(It.IsAny())).returns(OK);
  m.setup((x) => x.setParameterByName(It.IsAny(), It.IsAny(), It.IsAny())).returns(OK);
  return m;
}

/** Creates the raw FMOD mock objects without instantiating FMODAudio. */
function makeMocks(instanceMock: Mock<FMODEventInstance>) {
  const instance = instanceMock.object();

  const desc = {
    createInstance: vi.fn((out: FMODOutVal<FMODEventInstance>) => {
      out.val = instance;
      return OK;
    }),
    loadSampleData: vi.fn(() => OK),
    getPath: vi.fn((out: FMODOutVal<string>) => {
      out.val = 'event:/Test/Event';
      return OK;
    }),
  };

  const bank = {
    getEventCount: vi.fn((out: FMODOutVal<number>) => {
      out.val = 1;
      return OK;
    }),
    getEventList: vi.fn((out: FMODOutVal<unknown[]>, _cap: number, cntOut: FMODOutVal<number>) => {
      out.val = [desc];
      cntOut.val = 1;
      return OK;
    }),
  };

  const system = {
    getEvent: vi.fn((_path: string, out: FMODOutVal<FMODEventDescription>) => {
      out.val = desc as FMODEventDescription;
      return OK;
    }),
    update: vi.fn(() => OK),
    loadBankFile: vi.fn((_f: string, _fl: number, out: FMODOutVal<FMODBank>) => {
      out.val = bank as FMODBank;
      return OK;
    }),
  };

  const fmod = {
    OK,
    STUDIO_STOP_IMMEDIATE: 1,
    STUDIO_STOP_ALLOWFADEOUT: 2,
    STUDIO_LOAD_BANK_NORMAL: 0,
    ErrorString: () => '',
    FS_createDataFile: vi.fn(),
  };

  return { desc, bank, system, fmod };
}

/** Instantiates FMODAudio with pre-wired mocks injected via the constructor. */
function wireAudio(instanceMock: Mock<FMODEventInstance>) {
  const mocks = makeMocks(instanceMock);
  const audio = FMODAudio.getInstance({
    fmod: mocks.fmod as Partial<FMODObject>,
    system: mocks.system as Partial<FMODStudioSystem>,
    initialized: true,
  });
  return { audio, ...mocks };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('FMODAudio', () => {
  const mockFetchWasmBinary = vi.fn().mockResolvedValue(new Uint8Array(0));

  beforeEach(() => {
    FMODAudio['_instance'] = null;
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('initializes the runtime and returns true', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      });

      const coreSystem = {
        setDSPBufferSize: vi.fn(() => OK),
        getDriverInfo: vi.fn((_id: number, _n: null, _nl: null, out: FMODOutVal<number>) => {
          out.val = 44100;
          return OK;
        }),
        setSoftwareFormat: vi.fn(() => OK),
      };
      const system = {
        getCoreSystem: vi.fn((out: FMODOutVal<typeof coreSystem>) => {
          out.val = coreSystem;
          return OK;
        }),
        initialize: vi.fn(() => OK),
        update: vi.fn(() => OK),
      };

      vi.mocked(FMODModuleFactory).mockImplementation((config: Partial<FMODObject>) => {
        Object.assign(config, {
          OK,
          STUDIO_INIT_NORMAL: 0,
          INIT_NORMAL: 0,
          SPEAKERMODE_DEFAULT: 0,
          ErrorString: () => '',
          Studio_System_Create: (out: FMODOutVal<typeof system>) => {
            out.val = system;
            return OK;
          },
        });
        (config as { onRuntimeInitialized(): void }).onRuntimeInitialized();
      });

      const wasmBinary = await mockFetchWasmBinary();
      const audio = FMODAudio.getInstance();
      expect(await audio.init(wasmBinary)).toBe(true);
      expect(await audio.init(wasmBinary)).toBe(true); // idempotent
      expect(vi.mocked(FMODModuleFactory)).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadBank', () => {
    it('fetches the bank, mounts it in FS and stores the reference', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
      });

      const { audio, fmod, system } = wireAudio(buildInstanceMock());
      await audio.loadBank('/assets/Master.bank');

      expect(fmod.FS_createDataFile).toHaveBeenCalledWith(
        '/',
        'Master.bank',
        expect.any(Uint8Array),
        true,
        false
      );
      expect(system.loadBankFile).toHaveBeenCalledWith('/Master.bank', OK, expect.any(Object));
      expect(audio['_banks']).toHaveLength(1);
    });
  });

  describe('playEvent', () => {
    it('starts the instance and applies volume, playbackRate and parameters', () => {
      const m = buildInstanceMock();
      const { audio } = wireAudio(m);

      audio.playEvent({
        eventPath: 'event:/Music/Theme',
        options: { volume: 0.5, playbackRate: 1.5, parameters: { intensity: 2, wetness: 0.3 } },
      });

      m.verify((x) => x.start(), Times.Once());
      m.verify((x) => x.setVolume(0.5), Times.Once());
      m.verify((x) => x.setPitch(1.5), Times.Once());
      m.verify((x) => x.setParameterByName('intensity', 2, false), Times.Once());
      m.verify((x) => x.setParameterByName('wetness', 0.3, false), Times.Once());
    });
  });

  describe('stopEvent', () => {
    it('stops the instance immediately by default', () => {
      const m = buildInstanceMock();
      const { audio, fmod } = wireAudio(m);
      const inst = audio.playEvent({ eventPath: 'event:/Sfx/Hit' });

      assert(inst !== null);

      audio.stopEvent(inst);

      m.verify((x) => x.stop(fmod.STUDIO_STOP_IMMEDIATE), Times.Once());
    });

    it('uses ALLOWFADEOUT mode when requested', () => {
      const m = buildInstanceMock();
      const { audio, fmod } = wireAudio(m);
      const inst = audio.playEvent({ eventPath: 'event:/Sfx/Hit' });

      assert(inst !== null);

      audio.stopEvent(inst, true);

      m.verify((x) => x.stop(fmod.STUDIO_STOP_ALLOWFADEOUT), Times.Once());
    });
  });

  describe('logEventPaths', () => {
    it('iterates all banks and logs their event paths', () => {
      const m = buildInstanceMock();
      const { bank, system, fmod } = makeMocks(m);
      const audio = FMODAudio.getInstance({
        fmod: fmod as Partial<FMODObject>,
        system: system as Partial<FMODStudioSystem>,
        banks: [bank] as FMODBank[],
        initialized: true,
      });

      audio.logEventPaths();

      expect(bank.getEventCount).toHaveBeenCalled();
      expect(bank.getEventList).toHaveBeenCalled();
      expect(vi.mocked(logger)).toHaveBeenCalledWith(expect.objectContaining({ type: 'info' }));
    });
  });

  describe('playEventInSoundChannel', () => {
    const CHANNEL = 'sfx';

    it('applies the channel volume to the instance', () => {
      const m = buildInstanceMock();
      const { audio } = wireAudio(m);
      vi.mocked(useSoundsStore.getState).mockReturnValue({
        soundChannels: new Map([[CHANNEL, { id: CHANNEL, volume: 0.6, muted: false }]]),
      } as never);

      audio.playEventInSoundChannel({ eventPath: 'event:/Sfx/Amb', channelId: CHANNEL });

      m.verify((x) => x.setVolume(0.6), Times.Once());
    });

    it('sets volume to 0 when the channel is muted', () => {
      const m = buildInstanceMock();
      const { audio } = wireAudio(m);
      vi.mocked(useSoundsStore.getState).mockReturnValue({
        soundChannels: new Map([[CHANNEL, { id: CHANNEL, volume: 1, muted: true }]]),
      } as never);

      audio.playEventInSoundChannel({ eventPath: 'event:/Sfx/Amb', channelId: CHANNEL });

      m.verify((x) => x.setVolume(0), Times.Once());
    });

    it('applies playbackRate and parameters from options', () => {
      const m = buildInstanceMock();
      const { audio } = wireAudio(m);
      vi.mocked(useSoundsStore.getState).mockReturnValue({
        soundChannels: new Map([[CHANNEL, { id: CHANNEL, volume: 1, muted: false }]]),
      } as never);

      audio.playEventInSoundChannel({
        eventPath: 'event:/Sfx/Amb',
        channelId: CHANNEL,
        options: { playbackRate: 2, parameters: { mood: 1 } },
      });

      m.verify((x) => x.setPitch(2), Times.Once());
      m.verify((x) => x.setParameterByName('mood', 1, false), Times.Once());
    });

    it('unsubscribes from the store when stopEvent is called', () => {
      const m = buildInstanceMock();
      const { audio } = wireAudio(m);
      const unsubscribe = vi.fn();
      vi.mocked(useSoundsStore.subscribe).mockReturnValue(unsubscribe);
      vi.mocked(useSoundsStore.getState).mockReturnValue({
        soundChannels: new Map([[CHANNEL, { id: CHANNEL, volume: 1, muted: false }]]),
      } as never);

      const inst = audio.playEventInSoundChannel({
        eventPath: 'event:/Sfx/Amb',
        channelId: CHANNEL,
      });

      assert(inst !== null);
      expect(audio['_channelSubscriptions'].size).toBe(1);

      audio.stopEvent(inst);

      expect(unsubscribe).toHaveBeenCalledTimes(1);
      expect(audio['_channelSubscriptions'].size).toBe(0);
    });

    it('returns existing promise when init is called multiple times before it resolves', async () => {
      vi.mocked(FMODModuleFactory).mockImplementation(() => {
        // intentionally do NOT call onRuntimeInitialized yet
      });

      const wasmBinary = await mockFetchWasmBinary();
      const audio = FMODAudio.getInstance();
      const promise = audio.init(wasmBinary);
      const concurrentPromise = audio.init(wasmBinary);
      expect(promise).toBe(concurrentPromise);
    });
  });
});
