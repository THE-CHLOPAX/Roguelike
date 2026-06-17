import { describe, it, expect, vi, beforeEach, assert } from 'vitest';

import {
  useSoundsStore,
  MAIN_SOUND_CHANNEL,
  addSoundChannel,
  removeSoundChannel,
  setChannelVolume,
  setChannelMuted,
  playSoundInChannel,
  stopSoundInChannel,
} from './useSoundsStore';

function makeAudio(src = 'http://localhost/test.mp3') {
  const audio = new Audio(src);
  vi.spyOn(audio, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(audio, 'pause').mockImplementation(() => {});
  return audio;
}

function makeAudioWithClone(src = 'http://localhost/test.mp3') {
  const clone = makeAudio(src);
  const original = makeAudio(src);
  vi.spyOn(original, 'cloneNode').mockReturnValue(clone);
  return { original, clone };
}

describe('useSoundsStore', () => {
  beforeEach(() => {
    useSoundsStore.setState({
      soundChannels: new Map([
        [MAIN_SOUND_CHANNEL, { id: MAIN_SOUND_CHANNEL, volume: 1, muted: false }],
      ]),
      soundsPlaying: new Map(),
    });
  });

  describe('channels', () => {
    it('addSoundChannel adds the channel to the store', () => {
      addSoundChannel({ id: 'sfx', volume: 0.5, muted: false });
      expect(useSoundsStore.getState().soundChannels.get('sfx')).toEqual({
        id: 'sfx',
        volume: 0.5,
        muted: false,
      });
    });

    it('removeSoundChannel removes the channel from the store', () => {
      addSoundChannel({ id: 'sfx', volume: 1, muted: false });
      removeSoundChannel('sfx');
      expect(useSoundsStore.getState().soundChannels.has('sfx')).toBe(false);
    });
  });

  describe('volume', () => {
    it('setChannelVolume updates channel volume in the store', () => {
      setChannelVolume(MAIN_SOUND_CHANNEL, 0.4);
      expect(useSoundsStore.getState().soundChannels.get(MAIN_SOUND_CHANNEL)?.volume).toBe(0.4);
    });

    it('setChannelVolume adjusts the element volume for all playing sounds in the channel', () => {
      const { original, clone } = makeAudioWithClone();
      playSoundInChannel(original, MAIN_SOUND_CHANNEL);

      setChannelVolume(MAIN_SOUND_CHANNEL, 0.5);

      // initialVolume (1) * channelVolume (0.5) = 0.5
      expect(clone.volume).toBe(0.5);
    });

    it('setChannelVolume does not affect sounds playing in other channels', () => {
      addSoundChannel({ id: 'sfx', volume: 1, muted: false });
      const { original, clone } = makeAudioWithClone('http://localhost/sfx.mp3');
      playSoundInChannel(original, 'sfx');

      setChannelVolume(MAIN_SOUND_CHANNEL, 0.2);

      expect(clone.volume).toBe(1);
    });
  });

  describe('muted', () => {
    it('setChannelMuted updates the muted state in the store', () => {
      setChannelMuted(MAIN_SOUND_CHANNEL, true);
      expect(useSoundsStore.getState().soundChannels.get(MAIN_SOUND_CHANNEL)?.muted).toBe(true);
    });

    it('setChannelMuted(true) mutes all playing sounds in the channel', () => {
      const { original, clone } = makeAudioWithClone();
      playSoundInChannel(original, MAIN_SOUND_CHANNEL);

      setChannelMuted(MAIN_SOUND_CHANNEL, true);

      expect(clone.muted).toBe(true);
    });

    it('setChannelMuted(false) unmutes all playing sounds in the channel', () => {
      const { original, clone } = makeAudioWithClone();
      playSoundInChannel(original, MAIN_SOUND_CHANNEL);
      setChannelMuted(MAIN_SOUND_CHANNEL, true);

      setChannelMuted(MAIN_SOUND_CHANNEL, false);

      expect(clone.muted).toBe(false);
    });

    it('setChannelMuted does not affect sounds playing in other channels', () => {
      addSoundChannel({ id: 'sfx', volume: 1, muted: false });
      const { original, clone } = makeAudioWithClone('http://localhost/sfx.mp3');
      playSoundInChannel(original, 'sfx');

      setChannelMuted(MAIN_SOUND_CHANNEL, true);

      expect(clone.muted).toBe(false);
    });
  });

  describe('play / stop lifecycle', () => {
    it('playSoundInChannel adds the sound to soundsPlaying', () => {
      const { original } = makeAudioWithClone();
      const soundPlayingId = playSoundInChannel(original, MAIN_SOUND_CHANNEL);

      assert(soundPlayingId);
      expect(useSoundsStore.getState().soundsPlaying.has(soundPlayingId)).toBe(true);
    });

    it('playSoundInChannel applies channel volume and muted state to the element', () => {
      useSoundsStore.setState((state) => ({
        soundChannels: new Map(state.soundChannels).set(MAIN_SOUND_CHANNEL, {
          id: MAIN_SOUND_CHANNEL,
          volume: 0.6,
          muted: true,
        }),
      }));

      const { original, clone } = makeAudioWithClone();
      playSoundInChannel(original, MAIN_SOUND_CHANNEL);

      expect(clone.volume).toBe(0.6);
      expect(clone.muted).toBe(true);
    });

    it('stopSoundInChannel removes the sound from soundsPlaying and pauses the element', () => {
      const { original, clone } = makeAudioWithClone();
      const soundPlayingId = playSoundInChannel(original, MAIN_SOUND_CHANNEL);
      assert(soundPlayingId);

      stopSoundInChannel(soundPlayingId);

      const key = `${original.src}-${MAIN_SOUND_CHANNEL}`;
      expect(useSoundsStore.getState().soundsPlaying.has(key)).toBe(false);
      expect(clone.pause).toHaveBeenCalledOnce();
    });

    it('sound is removed from soundsPlaying when it ends naturally', () => {
      const { original, clone } = makeAudioWithClone();
      const soundPlayingId = playSoundInChannel(original, MAIN_SOUND_CHANNEL);
      assert(soundPlayingId);

      clone.onended?.call(clone, new Event('ended'));

      expect(useSoundsStore.getState().soundsPlaying.has(soundPlayingId)).toBe(false);
    });

    it('removeSoundChannel stops all sounds in channel and removes the sound from soundsPlaying', () => {
      const { original } = makeAudioWithClone();
      const soundPlayingId = playSoundInChannel(original, MAIN_SOUND_CHANNEL);
      assert(soundPlayingId);

      removeSoundChannel(MAIN_SOUND_CHANNEL);

      expect(useSoundsStore.getState().soundsPlaying.has(soundPlayingId)).toBe(false);
    });
  });
});
