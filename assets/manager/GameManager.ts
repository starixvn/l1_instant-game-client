const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    @property(cc.BitmapFont)
    winBetfont: cc.BitmapFont = null;

    @property(cc.BitmapFont)
    acceptedBetfont: cc.BitmapFont = null;

    @property(cc.AudioClip)
    clickAudioClip: cc.AudioClip = null;

    @property(cc.AudioClip)
    unClickAudioClip: cc.AudioClip = null;

    public static Instance: GameManager;

    dataObservers = {};
    soundObservers = {};
    userStakeLevel = {};

    onLoad() {
        GameManager.Instance = this;
    }

    sendToMainSocket(data: any) {
        console.log("sendToMainSocket ", data);
    }

    isSoundGame(): boolean {
        const check = cc.sys.localStorage.getItem("SOUND_GAME");

        if (check === null || check === undefined) {
            this.setSoundGame(true);
            return true;
        }

        return check === "true";
    }

    setSoundGame(bool: boolean) {
        cc.sys.localStorage.setItem("SOUND_GAME", bool);

        Object.keys(cc.RedT.soundObservers).forEach((key) => {
            var observer = cc.RedT.soundObservers[key];
            observer && observer(bool);
        });
    }

    addSoundObserver(key, observer) {
        this.soundObservers[key] = observer;
    }
    removeSoundObserver(key) {
        delete this.soundObservers[key];
    }

    private _playSFX(clip: cc.AudioClip) {
        if (this.isSoundGame()) {
            cc.audioEngine.playEffect(clip, false);
        }
    }

    playClick() {
        this._playSFX(this.clickAudioClip);
    }

    playUnClick() {
        this._playSFX(this.unClickAudioClip);
    }
}
