import {ServiceLocator} from "./ServiceLocator";
import {AudioListener, AudioLoader, PositionalAudio, Audio} from "three";
import {GameObject} from "./GameObject";

export class AudioEngine {
    private readonly listener: AudioListener
    private sounds: Map<string, Audio | PositionalAudio> = new Map();

    private paused: Array<Audio | PositionalAudio> = [];


    constructor() {
        ServiceLocator.setService<AudioEngine>('audio', this);
        this.listener = new AudioListener();
    }

    async loadPositionalSound(path: string, key: string, source: GameObject) {
        const audioLoader = new AudioLoader();

        const buffer = await audioLoader.loadAsync(path);
        const sound = new PositionalAudio(this.listener);
        sound.setBuffer(buffer);

        this.sounds.set(key, sound);
        source.object3D.add(sound);

        return sound;
    }

    async loadSound(path: string, key: string) {
        const audioLoader = new AudioLoader();

        const buffer = await audioLoader.loadAsync(path);
        const sound = new PositionalAudio(this.listener);
        sound.setBuffer(buffer);

        this.sounds.set(key, sound);

        return sound;
    }

    getSound(key: string) {
        return this.sounds.get(key);
    }

    getListener() {
        return this.listener;
    }

    pauseAll() {
        this.sounds.forEach(sound => {
            if (sound.isPlaying) {
                sound.pause()
                this.paused.push(sound);
            }
        });
    }

    playPaused() {
        this.paused.forEach(sound => sound.play());
        this.paused = [];
    }

    stopAll() {
        this.sounds.forEach(sound => {
            console.log(sound)
            sound.stop();
        })
    }
}
