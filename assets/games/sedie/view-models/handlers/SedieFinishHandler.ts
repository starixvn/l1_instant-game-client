import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import Sedie from "../Sedie";

export default class SedieFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: Sedie) {
        super(main);
    }

    handleFinishData(dataFinish, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
        this.main.showResult();

        cc.tween(this.main)
            .call(() => this.main.openPlate(true))
            .delay(0.5)
            .call(() => onFinishHandlingData())
            .start();
    }
}
