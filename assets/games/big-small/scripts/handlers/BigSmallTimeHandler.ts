import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import BigSmall from "../BigSmall";

export default class BigSmallTimeHandler extends GameBaseTimeHandler {
    protected shakeThePlateTime = 52;
    protected displayResultTime = 59;

    constructor(protected readonly main: BigSmall) {
        super(main);
    }

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.shakeThePlateTime;
    }

    get isInBalanceBetTime() {
        return this.main.currentTimeRemaining > this.displayResultTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.shakeThePlateTime;
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
                cc.GameManager.GAME_IS_SHOWED && this.main.showResult(true);
                this.main.currentTimeRemaining--;
            } else {
                super.gameUpdate();
            }
        }
    }


    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.main.statusHandler.currentStatusData = null;
        cc.GameManager.GAME_IS_SHOWED && this.shakeThePlate();
    }

    handleInRoundTime() {
        this.main.setGameRound(this.main.roundId);
        this.main.resetThePlate();
        this.main.betItems.forEach((item) => item.resetHighlight());

        if (this.main.currentTimeRemaining <= this.main.config.betTime) {
            this.showRoundTime();
        }
    }

    handleWaitTime() {
        super.handleWaitTime();
        this.main.thePlate.opacity = 0;
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.shakeThePlateTime - 1);
    }

    shakeThePlate() {
        cc.tween(this.main.thePlate)
            .to(0, { opacity: 255 })
            .to(0.3, { position: cc.v2(0, 7) })
            .call(() => {
                this.main.shakeThePlateAnimation.play();
            })
            .start();
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.betItems.forEach((item) => item.setHighlight(false));
    }
}
