import { StorageManager } from "../../manager/StorageManager";

export default class AudioManager {
    public clickAudio: cc.AudioClip = null;

    public static getInstance(): AudioManager {
        if (!this.instance) {
            this.instance = new AudioManager();
        }

        return this.instance;
    }

    private static instance: AudioManager;

    private readonly soundObservers = { music: {}, sfx: {} };

    public init() {
        this.initDefaultStorage();
    }

    playClick() {
        if (this.clickAudio) {
            this.playSFX(this.clickAudio);
        }
    }

    playSFX(clip: cc.AudioClip): number {
        if (this.sfxEnabled && clip) {
            return cc.audioEngine.playEffect(clip, false);
        }
        return -1;
    }

    stopSFX(audioId: number) {
        cc.audioEngine.stopEffect(audioId);
    }

    stopAllSFX() {
        cc.audioEngine.stopAllEffects();
    }

    playMusic(clip: cc.AudioClip, loop: boolean) {
        if (this.musicEnabled && clip) {
            cc.audioEngine.playMusic(clip, loop);
        }
    }

    private initDefaultStorage() {
        const background = StorageManager.get().get("SOUND_BACKGROUND");
        if (background === null || background === undefined) {
            this.musicEnabled = true;
        }

        const sfx = StorageManager.get().get("SOUND_GAME");
        if (sfx === null || sfx === undefined) {
            this.sfxEnabled = true;
        }
    }

    addMusicChanged(key: string, observer: (changed: boolean) => void) {
        this.soundObservers["music"][key] = observer;
    }

    removeMusicChanged(key: string) {
        delete this.soundObservers["music"][key];
    }

    addSfxChanged(key: string, observer: (changed: boolean) => void) {
        this.soundObservers["sfx"][key] = observer;
    }

    removeSfxChanged(key: string) {
        delete this.soundObservers["sfx"][key];
    }

    private onMusicChanged(value: boolean) {
        const observers = this.soundObservers["music"];
        this.callObservers(observers, value);
    }

    private onSfxChanged(value: boolean) {
        const observers = this.soundObservers["sfx"];
        this.callObservers(observers, value);
    }

    private callObservers(observers: any, value: boolean) {
        Object.keys(observers).forEach((key) => {
            const observer = observers[key];
            observer(value);
        });
    }

    get musicEnabled(): boolean {
        const check = StorageManager.get().get("SOUND_BACKGROUND");

        return check === "true";
    }

    set musicEnabled(value: boolean) {
        StorageManager.get().set("SOUND_BACKGROUND", value.toString());
        this.onMusicChanged(value);
    }

    get sfxEnabled(): boolean {
        const check = StorageManager.get().get("SOUND_GAME");
        return check === "true";
    }

    set sfxEnabled(value: boolean) {
        StorageManager.get().set("SOUND_GAME", value.toString());
        this.onSfxChanged(value);
    }
}
