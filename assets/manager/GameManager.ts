import MiniPanel from "../common/control/mini-panel/MiniPanel";
import { GameIds } from "../configs/SabaConfigs";

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
    // sleepTime: number;
    user: any = {};
    supportGames: number[] = [];

    onLoad() {
        this.supportGames.push(...[GameIds.MiniSedie, GameIds.BigSmall, GameIds.FishPrawnCrab, GameIds.DragonTiger]);
        GameManager.Instance = this;
        cc.game.on(cc.game.EVENT_HIDE, () => {
            this.GAME_IS_SHOWED = false;
        });

        cc.game.on(cc.game.EVENT_SHOW, () => {
            this.GAME_IS_SHOWED = true;
        });
    }

    userStakeLevelData(data) {
        this.userStakeLevel.minBet = data.minBet;
        this.userStakeLevel.maxBet = data.maxBet;
    }

    loadUserData(data: any) {
        this.user = { ...this.user, ...data };
        if (data.offerGames) {
            this.user.offerGames = data.offerGames.map((item) => +item.gameId);
        }
    }

    sendToMainSocket(data: any) {}

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

    playSFX(clip: cc.AudioClip) {
        if (this.isSoundGame() && clip) {
            cc.audioEngine.playEffect(clip, false);
        }
    }

    playClick() {
        this.playSFX(this.clickAudioClip);
    }

    playUnClick() {
        this.playSFX(this.unClickAudioClip);
    }

    isNoGameOffer(): boolean {
        let result = true;
        result = !this.supportGames.some((id) => this.user.offerGames.includes(id));
        return result;
    }

    isGameExcluded(gameId: number): boolean {
        return !this.supportGames.includes(gameId) || !this.user.offerGames.includes(gameId);
    }

    getFirstOfferGame(): number {
        return this.supportGames.find((game) => this.user.offerGames.includes(game));
    }

    removeGameOffer(gameId: number) {
        if (this.user && this.user.offerGames) {
            const index = this.user.offerGames.findIndex((id) => id === gameId);
            if (index > -1) {
                this.user.offerGames.splice(index, 1);
            }
        }
    }
}
