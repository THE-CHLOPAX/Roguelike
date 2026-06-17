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
    const soundsPlaying = useSoundsStore.getState().soundsPlaying;
    for (const sound of soundsPlaying.values()) {
      if (sound.channelId === channelId) {
        sound.element.volume = sound.initialVolume * volume;
      }
    }
    const updatedChannel = { ...channel, volume };
    useSoundsStore.setState((state) => ({
      soundChannels: new Map(state.soundChannels).set(channelId, updatedChannel),
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
    const soundsPlaying = useSoundsStore.getState().soundsPlaying;
    for (const sound of soundsPlaying.values()) {
      if (sound.channelId === channelId) {
        sound.element.muted = muted;
      }
    }

    const updatedChannel = { ...channel, muted };
    useSoundsStore.setState((state) => ({
      soundChannels: new Map(state.soundChannels).set(channelId, updatedChannel),
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
  const soundsPlaying = useSoundsStore.getState().soundsPlaying;

  for (const [key, sound] of soundsPlaying.entries()) {
    if (sound.channelId === channelId) {
      stopSoundInChannel(key);
    }
  }

  const newSoundChannels = new Map(useSoundsStore.getState().soundChannels);
  newSoundChannels.delete(channelId);

  useSoundsStore.setState(() => ({
    soundChannels: newSoundChannels,
  }));
};

export const playSoundInChannel = (
  audioElement: HTMLAudioElement,
  channelId: string
): string | undefined => {
  const channel = useSoundsStore.getState().soundChannels.get(channelId);
  if (channel) {
    const newAudioElement = audioElement.cloneNode() as HTMLAudioElement;
    const initialVolume = newAudioElement.volume;

    const soundPlayingId = crypto.randomUUID();

    const soundPlaying: SoundPlaying = {
      element: newAudioElement,
      initialVolume,
      channelId,
    };
    useSoundsStore.setState((state) => ({
      soundsPlaying: new Map(state.soundsPlaying).set(soundPlayingId, soundPlaying),
    }));

    newAudioElement.volume = initialVolume * channel.volume;
    newAudioElement.muted = channel.muted;
    newAudioElement.onended = () => {
      stopSoundInChannel(soundPlayingId);
    };
    newAudioElement.play().catch((_error) => {
      logger({
        message: `SoundsStore: unable to play sound in channel.
        Sound ${soundPlayingId} not added to map`,
        type: 'error',
      });
      return undefined;
    });

    return soundPlayingId;
  } else {
    logger({
      message: `SoundsStore: unable to play sound in channel. Channel ${channelId} not found`,
      type: 'error',
    });
    return undefined;
  }
};

export const stopSoundInChannel = (soundPlayingId: string) => {
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
