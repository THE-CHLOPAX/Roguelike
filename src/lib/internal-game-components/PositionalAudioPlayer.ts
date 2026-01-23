import * as THREE from 'three';
import { logger, GameObject, SoundChannel, SceneEventsMap, useSoundsStore, GameObjectEventMap } from '@tgdf';

import { GameObjectComponent } from './GameObjectComponent';

export type PositionalAudioPlayerOptions = {
    refDistance?: number;
    maxDistance?: number;
    rolloffFactor?: number;
    distanceMode?: 'linear' | 'inverse' | 'exponential';
    loop?: boolean;
}

export class PositionalAudioPlayer<T extends GameObjectEventMap = GameObjectEventMap, K extends SceneEventsMap = SceneEventsMap> extends GameObjectComponent<PositionalAudioPlayerOptions, K, T> {
    private _listener: THREE.AudioListener;
    private _positionalAudio: THREE.PositionalAudio;
    private _audioBuffer: AudioBuffer | null = null;
    private _bufferCache: Map<string, AudioBuffer> = new Map();
    private _currentSoundVolume: number = 1;
    private _soundChannelId: string | null = null;
        
    private _soundChannelUnsubscribe: (() => void) | null = null;
    private _onSoundChannelVolumeChange = (soundChannel: SoundChannel | null) => {
        if (soundChannel) {
            this._positionalAudio.setVolume(soundChannel.volume * this._currentSoundVolume);
        }
    };

    constructor(gameObject: GameObject<T, K>, options: PositionalAudioPlayerOptions = {}) {
        super(gameObject, options);
        this._listener = new THREE.AudioListener();
        this._positionalAudio = new THREE.PositionalAudio(this._listener);

        this._positionalAudio.setRefDistance(options.refDistance || 1);
        this._positionalAudio.setMaxDistance(options.maxDistance || 10000);
        this._positionalAudio.setRolloffFactor(options.rolloffFactor || 1);
        this._positionalAudio.setDistanceModel(options.distanceMode || 'exponential');
        this._positionalAudio.setLoop(options.loop || false);
    }

    public isPlaying(): boolean {
        return this._positionalAudio.isPlaying;
    }

    public setVolume(value: number): void {
        // If sound channelId is present, use it as volume factor.
        if (this._soundChannelId) {
            const soundChannel = useSoundsStore.getState().soundChannels.get(this._soundChannelId);
            if (soundChannel) {
                value *= soundChannel.volume;
            }
        }

        this._positionalAudio.setVolume(value);
    }

    public setRefDistance(value: number): void {
        this._positionalAudio.setRefDistance(value);
    }

    public setMaxDistance(value: number): void {
        this._positionalAudio.setMaxDistance(value);
    }

    public setRolloffFactor(value: number): void {
        this._positionalAudio.setRolloffFactor(value);
    }

    public setDistanceModel(model: 'linear' | 'inverse' | 'exponential'): void {
        this._positionalAudio.setDistanceModel(model);
    }

    public setLoop(loop: boolean): void {
        this._positionalAudio.setLoop(loop);
    }

    public pause(): void {
        this._positionalAudio.pause();
    }

    public stop(): void {
        this._positionalAudio.stop();
        this._soundChannelId = null;
    }

    public async loadAudio(audioElement: HTMLAudioElement): Promise<void> {
        return new Promise((resolve, reject) => {
            this._loadAudioBuffer(audioElement).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }

    public play(audioElement: HTMLAudioElement, options?: { channelId?: string; loop?: boolean; offset?: number, delay?: number, volume?: number }): void {
        if (!this._bufferCache.has(audioElement.src)) {
            logger({ message: `PositionalAudioPlayer: No audio buffer available for element src: ${audioElement.src}`, type: 'warn' });
        }

        this._positionalAudio.setLoop(options?.loop || false);
        this._positionalAudio.offset = options?.offset || 0;

        let channelVolume = 1;

        if (options?.channelId) {
            if (this._soundChannelUnsubscribe && options?.channelId !== this._soundChannelId) {
                this._soundChannelUnsubscribe();
            }
            this._soundChannelUnsubscribe = this._setSoundChannelListener();
            const soundChannel = useSoundsStore.getState().soundChannels.get(options?.channelId);
            if (soundChannel) {
                this._soundChannelId = options?.channelId;
                channelVolume = soundChannel.volume;
            } else {
                this._soundChannelId = null;
                logger({
                    message: 'PositionalAudioPlayer: SoundChannel id: ' + options?.channelId + ' not found.',
                    type: 'warn'
                });
            }
        }

        this._currentSoundVolume = options?.volume || 1;

        const volume = channelVolume * this._currentSoundVolume;

        this._positionalAudio.setVolume(volume);
        this._positionalAudio.play(options?.delay || 0);
    };

    protected override onAwake(): void {
        this.gameObject.add(this._positionalAudio);

        if (!this.gameObject.scene?.camera) {
            logger({ message: 'PositionalAudioPlayer: No camera found in scene.', type: 'warn' });
            return;
        }

        this.gameObject.scene?.camera.add(this._listener);
    }

    private _setSoundChannelListener(): (() => void) | null {
        if (!this._soundChannelId) return null;

        return useSoundsStore.subscribe((state) => {
            this._onSoundChannelVolumeChange(state.soundChannels.get(this._soundChannelId!) ?? null);
        });
    }

    private async _loadAudioBuffer(audioElement: HTMLAudioElement): Promise<void> {
        return new Promise((resolve, reject) => {
            const audioLoader = new THREE.AudioLoader();

            if (this._bufferCache.has(audioElement.src)) {
                this._audioBuffer = this._bufferCache.get(audioElement.src)!;
                this._positionalAudio.setBuffer(this._audioBuffer);
                resolve();
            }

            audioLoader.load(audioElement.src, (buffer) => {
                this._audioBuffer = buffer;
                this._bufferCache.set(audioElement.src, buffer);
                this._positionalAudio.setBuffer(buffer);
                resolve();
            }, undefined, (error) => {
                reject(error);
            });
        });
    }
}