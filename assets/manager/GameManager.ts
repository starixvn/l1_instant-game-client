import MiniPanel from "../common/control/mini-panel/MiniPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    @property(cc.BitmapFont)
    winBetFont: cc.BitmapFont = null;

    @property(cc.BitmapFont)
    acceptedBetfont: cc.BitmapFont = null;

    @property(cc.AudioClip)
    clickAudioClip: cc.AudioClip = null;

    @property(cc.AudioClip)
    unClickAudioClip: cc.AudioClip = null;

    public static Instance: GameManager;
    miniPanel: MiniPanel;

    GAME_IS_SHOWED = true;
    IS_LOGIN = false;
    dataObservers = {};
    soundObservers = {};
    userStakeLevel: any = {};
    sleepTime: number;
    user: any;

    onLoad() {
        GameManager.Instance = this;
        cc.game.on(cc.game.EVENT_HIDE, () => {
            this.GAME_IS_SHOWED = false;
            this.sleepTime = Date.now();
        });

        cc.game.on(cc.game.EVENT_SHOW, () => {
            this.GAME_IS_SHOWED = true;
            this.IS_LOGIN && this.sendToMainSocket({ user: { updateCoin: true } });

            if (cc.sys.isMobile) {
                const sleepSecond = (Date.now() - this.sleepTime) / 1000;

                if (sleepSecond > 300) {
                    this.miniPanel.onForceReload(false);
                }
            }
        });
    }

    userStakeLevelData(data) {
        this.userStakeLevel.minBet = data.minBet;
        this.userStakeLevel.maxBet = data.maxBet;
    }

    loadUserData(data: any) {
        console.log("user data loaded ", data);
        this.user = { ...data };
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

        Object.keys(this.soundObservers).forEach((key) => {
            var observer = this.soundObservers[key];
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
