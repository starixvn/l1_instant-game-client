import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import SicBo from "../SicBo";

export default class SicBoFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: SicBo) {
        super(main, 3);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
        this.main.setResult();

        if (cc.GameManager.GAME_IS_SHOWED) {
            cc.tween(this.main.node)
                .call(() => {
                    this.main.shakeAnimation.node.active = false;
                    this.main.openDiskAnimation.node.active = true;
                    this.main.openDiskAnimation.play();
                })
                .delay(this.playResultAnimationTime)
                .call(() => {
                    onFinishHandlingData();
                    this.main.highlightWinningBetItems();
                    this.main.updateStatistic(this.main.currentDataLogs);
                    this.main.updateRoundHistory();
                })
                .start();
        }
    }
}
