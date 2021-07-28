const { ccclass, property } = cc._decorator;

@ccclass
export default class GameAudios extends cc.Component {
    @property(cc.AudioSource)
    startGame: cc.AudioSource = null;

    @property(cc.AudioSource)
    endGame: cc.AudioSource = null;

    @property(cc.AudioSource)
    clockTick: cc.AudioSource = null;

    @property(cc.AudioSource)
    showResult: cc.AudioSource = null;

    playStartGameAudio() {
        cc.GameManager.isSoundGame() && this.startGame.play();
    }

    playEndGameAudio() {
        cc.GameManager.isSoundGame() && this.endGame.play();
    }

    playClockTickAudio() {
        cc.GameManager.isSoundGame() && this.clockTick.play();
    }

    playShowResultAudio() {
        cc.GameManager.isSoundGame() && this.showResult.play();
    }

    stopAllAudio() {
        this.startGame && this.startGame.stop();
        this.endGame && this.endGame.stop();
        this.clockTick && this.clockTick.stop();
        this.showResult && this.showResult.stop();
    }
}
