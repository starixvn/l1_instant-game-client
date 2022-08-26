import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import BauCua, { DishAnimation } from "../BauCua";

export default class BauCuaTimeHandler extends GameBaseTimeHandler {
    private get shakeThePlateTime() {
        return this.main.config.betTime + 2;
    }

    constructor(protected readonly main: BauCua) {
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
        cc.GameManager.GAME_IS_SHOWED && this.shakeThePlate();
    }

    handleInLockBetTime() {
        super.handleAtLockBetTime();
        this.handleInLockBetTimeOptions(this.main);
    }

    handleInRoundTime() {
        this.main.setGameRound(this.main.roundId);

        if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.showRoundTime();
        }
    }

    handleWaitTime() {
        super.handleWaitTime();

        if (!this.main.resultAnimating) {
            this.main.setDiceResult();
            this.main.highlightWinningBetItems(true);
            this.main.dishNode.active = false;
            this.main.resultAnimating = true;
        }

        const openDuration = this.main.animationNode.defaultClip.duration;
        const openTimePoint = this.main.config.betTime + openDuration;

        if (this.main.currentTimeRemaining === openTimePoint) {
            this.main.resetDataAndUI();
        }
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.shakeThePlateTime - 1);
    }

    shakeThePlate() {
        this.main.animationNode.playAdditive(DishAnimation.ShakeDish);
        cc.tween(this.main)
            .delay(0.5)
            .call(() => {
                this.main.hideAllDices();
            });
    }
}
