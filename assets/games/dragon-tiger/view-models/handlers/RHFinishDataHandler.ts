import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import RongHo from "../RongHo";

export default class RHFinishDataHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: RongHo) {
        super(main);
    }

    handleFinishData(dataFinish, onFinishHanlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHanlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();

        const result = dataFinish.result;
        this.main.resultCards = [result.dragon, result.tiger];
        if (cc.GameManager.GAME_IS_SHOWED) {
            this.main.playAnimationResult();
        }
    }
}
