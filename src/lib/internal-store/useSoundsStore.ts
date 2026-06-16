import { create } from 'zustand';
import { logger } from '@tgdf/internal-ui/utils/logger';

export const MAIN_SOUND_CHANNEL = 'main';

export type SoundChannel = {
  id: string;
  volume: number;
  muted: boolean;
};

export type SoundPlaying = {
  element: HTMLAudioElement;
  initialVolume: number;
  channelId: string;
};

export type SoundsState = {
  soundChannels: Map<string, SoundChannel>;
  soundsPlaying: Map<string, SoundPlaying>;
};

export const useSoundsStore = create<SoundsState>(() => ({
  soundChannels: new Map<string, SoundChannel>([
    [MAIN_SOUND_CHANNEL, { id: MAIN_SOUND_CHANNEL, volume: 1, muted: false }],
  ]),
  soundsPlaying: new Map<string, SoundPlaying>(),
}));

export const setChannelVolume = (channelId: string, volume: number) => {
  const channel = useSoundsStore.getState().soundChannels.get(channelId);
  if (channel) {
    channel.volume = volume;

    const soundsPlaying = useSoundsStore.getState().soundsPlaying;
    for (const sound of soundsPlaying.values()) {
      if (sound.channelId === channelId) {
        sound.element.volume = sound.initialVolume * volume;
      }
    }

    useSoundsStore.setState((state) => ({
      soundChannels: new Map(state.soundChannels).set(channelId, channel),
    }));
  } else {
    logger({
      message: `SoundsStore: unable to set channel volume. Channel ${channelId} not found`,
      type: 'error',
    });
  }
};

export const setChannelMuted = (channelId: string, muted: boolean) => {
  const channel = useSoundsStore.getState().soundChannels.get(channelId);
  if (channel) {
    channel.muted = muted;

    const soundsPlaying = useSoundsStore.getState().soundsPlaying;
    for (const sound of soundsPlaying.values()) {
      if (sound.channelId === channelId) {
        sound.element.muted = muted;
      }
    }

    useSoundsStore.setState((state) => ({
      soundChannels: new Map(state.soundChannels).set(channelId, channel),
    }));
  } else {
    logger({
      message: `SoundsStore: unable to set channel muted. Channel ${channelId} not found`,
      type: 'error',
    });
  }
};

export const addSoundChannel = (channel: SoundChannel) => {
  useSoundsStore.setState((state) => ({
    soundChannels: new Map(state.soundChannels).set(channel.id, channel),
  }));
};

export const removeSoundChannel = (channelId: string) => {
  const newSoundChannels = new Map(useSoundsStore.getState().soundChannels);
  newSoundChannels.delete(channelId);
  useSoundsStore.setState(() => ({
    soundChannels: newSoundChannels,
  }));
};

export const playSoundInChannel = (audioElement: HTMLAudioElement, channelId: string) => {
  const channel = useSoundsStore.getState().soundChannels.get(channelId);
  if (channel) {
    const newAudioElement = audioElement.cloneNode() as HTMLAudioElement;
    const initialVolume = newAudioElement.volume;

    const soundPlayingId = `${audioElement.src}-${channelId}`;

    if (useSoundsStore.getState().soundsPlaying.has(soundPlayingId)) {
      logger({
        message: `SoundsStore: sound already playing in channel ${channelId}. 
        Sound ${audioElement.src} not added to map`,
        type: 'warn',
      });
      return;
    }

    useSoundsStore.setState((state) => ({
      soundsPlaying: new Map(state.soundsPlaying).set(soundPlayingId, {
        element: newAudioElement,
        initialVolume,
        channelId,
      }),
    }));

    newAudioElement.volume = initialVolume * channel.volume;
    newAudioElement.muted = channel.muted;
    newAudioElement.play();

    newAudioElement.onended = () => {
      stopSoundInChannel(newAudioElement, channelId);
    };
  } else {
    logger({
      message: `SoundsStore: unable to play sound in channel. Channel ${channelId} not found`,
      type: 'error',
    });
  }
};

export const stopSoundInChannel = (audioElement: HTMLAudioElement, channelId: string) => {
  const soundPlayingId = `${audioElement.src}-${channelId}`;
  const soundPlaying = useSoundsStore.getState().soundsPlaying.get(soundPlayingId);
  if (soundPlaying) {
    soundPlaying.element.pause();

    const newSoundsPlaying = new Map(useSoundsStore.getState().soundsPlaying);
    newSoundsPlaying.delete(soundPlayingId);

    useSoundsStore.setState(() => ({
      soundsPlaying: newSoundsPlaying,
    }));
  } else {
    logger({
      message: `SoundsStore: unable to stop sound in channel. Sound ${soundPlayingId} not found`,
      type: 'error',
    });
  }
};
