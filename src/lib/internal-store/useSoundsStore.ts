import { create } from 'zustand';

import { useAssetStore } from './useAssetStore';
import { SoundChannel } from '../internal-ui/SoundChannel';

export const MAIN_SOUND_CHANNEL = 'main';

export type SoundsState = {
  soundChannels: Map<string, SoundChannel>;
  setSoundInChannel: (
    channelId: string,
    sound: string | HTMLAudioElement,
    options: Partial<HTMLAudioElement>
  ) => void;
  playSoundInChannel: (channelId: string, sound: string | HTMLAudioElement, options?: Partial<HTMLAudioElement>) => void;
  pauseSoundInChannel: (channelId: string, sound: string | HTMLAudioElement) => void;
  stopSoundInChannel: (channelId: string, sound: string | HTMLAudioElement) => void;
  addSoundChannel: (id: string, volume: number, muted: boolean) => void;
  removeSoundChannel: (id: string) => void;
  setChannelVolume: (id: string, volume: number) => void;
  setChannelMuted: (id: string, muted: boolean) => void;
}

export const useSoundsStore = create<SoundsState>((set) => ({
  soundChannels: new Map<string, SoundChannel>([[MAIN_SOUND_CHANNEL, new SoundChannel(MAIN_SOUND_CHANNEL, 50, false)]]),

  playSoundInChannel: (channelId: string, sound: string | HTMLAudioElement, options?: Partial<HTMLAudioElement>) => {
    const channel = useSoundsStore.getState().soundChannels.get(channelId);
    const { audioCache } = useAssetStore.getState();
    const soundElement = typeof sound === 'string' ? audioCache.get(sound) : sound;
    if (channel && soundElement) {
      channel.playSound(soundElement, options);
    }
  },

  pauseSoundInChannel: (channelId: string, sound: string | HTMLAudioElement) => {
    const channel = useSoundsStore.getState().soundChannels.get(channelId);
    const { audioCache } = useAssetStore.getState();
    const soundElement = typeof sound === 'string' ? audioCache.get(sound) : sound;
    if (channel && soundElement) {
      channel.pauseSound(soundElement);
    }
  },

  stopSoundInChannel: (channelId: string, sound: string | HTMLAudioElement) => {
    const channel = useSoundsStore.getState().soundChannels.get(channelId);
    const { audioCache } = useAssetStore.getState();
    const soundElement = typeof sound === 'string' ? audioCache.get(sound) : sound;
    if (channel && soundElement) {
      channel.stopSound(soundElement);
    }
  },

  setSoundInChannel: (
    channelId: string,
    sound: string | HTMLAudioElement,
    options: Partial<HTMLAudioElement>
  ) => {
    const channel = useSoundsStore.getState().soundChannels.get(channelId);
    const { audioCache } = useAssetStore.getState();
    const soundElement = typeof sound === 'string' ? audioCache.get(sound) : sound;
    if (channel && soundElement) {
      channel.setSound(soundElement, options);
    }
  },

  addSoundChannel: (id: string, volume: number, muted: boolean) => {
    const newChannel = new SoundChannel(id, volume, muted);
    set((state) => ({
      soundChannels: new Map(state.soundChannels).set(id, newChannel),
    }));
  },
  removeSoundChannel: (id: string) => {
    set((state) => {
      const newChannels = new Map(state.soundChannels);
      newChannels.delete(id);
      return { soundChannels: newChannels };
    });
  },
  setChannelVolume: (id: string, volume: number) => {
    set((state) => {
      const channel = state.soundChannels.get(id);
      if (channel) {
        channel.volume = volume;
        // Trigger re-render by creating new Map
        return { soundChannels: new Map(state.soundChannels) };
      }
      return state;
    });
  },
  setChannelMuted: (id: string, muted: boolean) => {
    set((state) => {
      const channel = state.soundChannels.get(id);
      if (channel) {
        channel.muted = muted;
        // Trigger re-render by creating new Map
        return { soundChannels: new Map(state.soundChannels) };
      }
      return state;
    });
  },
}));