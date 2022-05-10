import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import BigSmall from "../BigSmall";

export default class BigSmallFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: BigSmall) {
        super(main, 3);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
        this.main.showBalanceBetNotice();
        this.main.setDices(dataFinish.result);
        const delayForBalanceBet = 3;
        cc.tween(this.main.node)
            .delay(delayForBalanceBet)
            .call(() => onFinishHandlingData())
            .start();
    }
}
