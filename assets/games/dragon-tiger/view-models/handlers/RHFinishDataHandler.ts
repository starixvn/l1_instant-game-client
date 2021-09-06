import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import DragonTiger from "../DragonTiger";

export default class RHFinishDataHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: DragonTiger) {
        super(main, 0.8);
    }

    handleFinishData(dataFinish, onFinishHanlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHanlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();

        const result = dataFinish.result;
        this.main.resultCards = [result.dragon, result.tiger];
        if (cc.GameManager.GAME_IS_SHOWED) {
            if (cc.GameManager.GAME_IS_SHOWED) {
                cc.tween(this.main.node)
                    .call(() => {
                        this.main.playAnimationResult();
                    })
                    .delay(this.playResultAnimationTime)
                    .call(() => {
                        onFinishHanlingData();
                    })
                    .start();
            }
        }
    }
}
