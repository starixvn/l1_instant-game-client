import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import BigSmall from "../BigSmall";

export default class BigSmallTimeHandler extends GameBaseTimeHandler {
    protected displayResultTime = 58;

    constructor(protected readonly main: BigSmall) {
        super(main);
    }

    get isInBalanceBetTime() {
        return this.main.currentTimeRemaining > this.displayResultTime;
    }

    get isDisplayResultTime() {
        return this.main.currentTimeRemaining === this.displayResultTime;
    }

    gameUpdate(): void {
        if (this.isInBalanceBetTime) {
            this.main.balanceBet();
            this.main.currentTimeRemaining--;
        } else {
            this.main.hideBalanceBetNotice();

            if (this.isDisplayResultTime) {
                cc.GameManager.GAME_IS_SHOWED && this.main.showResult();
                this.main.showWinningAnimation(this.main.currentDataLogs[0]);
                this.main.currentTimeRemaining--;
            } else {
                super.gameUpdate();
            }
        }
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.main.statusHandler.currentStatusData = null;
    }

    handleInRoundTime() {
        this.main.setGameRound(this.main.roundId);
        this.main.betItems.forEach((item) => item.resetHighlight());

        if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.showRoundTime();
        }
    }

    handleWaitTime() {
        super.handleWaitTime();
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
    }
}
