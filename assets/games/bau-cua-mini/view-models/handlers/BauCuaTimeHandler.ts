import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import BauCua from "../BauCua";

export default class BauCuaTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: BauCua) {
        super(main);
    }

    handleInRoundTime() {
        super.handleInRoundTime();
        this.main.hideAllDices();
    }

    handleWaitTime() {
        super.handleWaitTime();

        if (!this.main.resultAnimating) {
            this.main.setDiceResult();
            this.main.highlightWinningBetItems(true);
            this.main.dishNode.active = false;
            this.main.resultAnimating = true;
        }

        const shakingDuration = this.main.animationNode.defaultClip.duration;
        const shakeTimePoint = this.main.config.betTime + shakingDuration;

        if (this.main.currentTimeRemaining === shakeTimePoint) {
            this.main.resetDataAndUI();
        }
    }
}
