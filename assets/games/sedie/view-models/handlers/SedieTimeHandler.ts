import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import Sedie from "../Sedie";

export default class SedieTimeHandler extends GameBaseTimeHandler {
    private get shakeThePlateTime() {
        return this.main.config.betTime + 2;
    }

    constructor(protected readonly main: Sedie) {
        super(main);
    }

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.shakeThePlateTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.shakeThePlateTime;
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.shakeThePlate();
        this.main.highlightLastResult();
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.betItems.forEach(item => item.setHighlight(false));
    }

    handleInRoundTime() {
        this.main.setGameRound(this.main.roundId);

        if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.showRoundTime();
        }
    }

    handleWaitTime() {
        super.handleWaitTime();

        if (this.main.currentTimeRemaining > this.shakeThePlateTime && !this.main.finishShowResult) {
            this.main.showResult();
            this.main.openPlate(false);
            this.main.finishShowResult = true;
        }
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.shakeThePlateTime - 1);
    }

    shakeThePlate() {
        cc.tween(this.main)
            .call(() => this.main.closePlate())
            .delay(0.5)
            .call(() => {
                cc.RedT.isSoundGame() && this.main.shakeThePlateAudio.play();
                this.main.shakeThePlateAnimation.play();
            })
            .start();
    }
}
