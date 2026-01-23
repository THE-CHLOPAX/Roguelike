import { logger } from './utils/logger';
import { SoundPlaying } from './types/sound';

export class SoundChannel {
  id: string;

  private _muted: boolean = false;
  private _volume: number = 1;
  private _currentlyPlaying: SoundPlaying[] = [];

  constructor(id: string, volume: number, muted: boolean) {
    this.id = id;
    this.volume = volume;
    this.muted = muted;
  }


  set volume(value: number) {
    if (value < 0) {
      logger({ message: 'SoundChannel: Volume cannot be less than 0. Setting to 0.', type: 'warn' });
      value = 0;
    };

    if (value > 1) {
      logger({ message: 'SoundChannel: Volume cannot be greater than 1. Setting to 1.', type: 'warn' });
      value = 1;
    }

    this._volume = value;

    if (this.muted) return;

    this._currentlyPlaying.forEach(sound => {
      sound.element.volume = sound.initialVolume * (this.muted ? 0 : this.volume);
    });
  }

  get volume(): number {
    return this._volume;
  }

  set muted(value: boolean) {
    this._muted = value;
    if (this._muted) {
      this._currentlyPlaying.forEach(sound => {
        sound.element.volume = 0;
      });
    } else {
      this._currentlyPlaying.forEach(sound => {
        sound.element.volume = sound.initialVolume * this._volume;
      });
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  setSound(sound: HTMLAudioElement, options: Partial<HTMLAudioElement>) {
    Object.assign(sound, options);
  }

  playSound(sound: HTMLAudioElement, options?: Partial<HTMLAudioElement>) {
    this._currentlyPlaying.push({
      element: sound,
      initialVolume: options?.volume ?? sound.volume,
    });

    const currentlyPlayingSound = this._currentlyPlaying.find(item => item.element === sound);

    if (!currentlyPlayingSound) {
      logger({ message: `SoundChannel: Failed to play sound on channel ${this.id}`, type: 'error' });
      return;
    }

    currentlyPlayingSound.element.loop = options?.loop || false;
    currentlyPlayingSound.element.currentTime = options?.currentTime || sound.currentTime;
    currentlyPlayingSound.element.volume = currentlyPlayingSound.initialVolume * (this.muted ? 0 : this.volume);
    currentlyPlayingSound.element.onended = () => {
      this._currentlyPlaying =
        this._currentlyPlaying.filter(item => item.element !== currentlyPlayingSound.element);
    };

    currentlyPlayingSound.element.play();
  }

  pauseSound(sound: HTMLAudioElement) {
    this._currentlyPlaying.forEach(playingSound => {
      if (playingSound.element.src === sound.src) {
        playingSound.element.pause();
      }
    });
  }

  stopSound(sound: HTMLAudioElement) {
    this._currentlyPlaying.forEach(playingSound => {
      if (playingSound.element.src === sound.src) {
        playingSound.element.pause();
        playingSound.element.currentTime = 0;
      }
    });
  }
}