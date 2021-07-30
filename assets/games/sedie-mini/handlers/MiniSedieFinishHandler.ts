import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import MiniSedie from "../MiniSedie";

export default class MiniSedieFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: MiniSedie) {
        super(main, 0);
    }

    handleFinishData(dataFinish, onFinishHanlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHanlingData);
        this.main.currentDataLogs.unshift(dataFinish);
        this.main.currentDataLogs.length > 100 && this.main.currentDataLogs.pop();
        this.main.timeHandler.resetTime();

        if (cc.GameManager.GAME_IS_SHOWED) {
            this.playResultAnimation(onFinishHanlingData);
        }
    }

    playResultAnimation(onFinishHanlingData: () => void) {
        if (cc.GameManager.GAME_IS_SHOWED) {
            const dataLog = this.main.currentDataLogs[0];
            this.main.setDots(dataLog.result);
            this.main.resultAnimating = true;
            this.main.dishNode.runAction(
                cc.sequence(
                    cc.moveBy(0.7, cc.v2(0, 150)),
                    cc.callFunc(() => {
                        this.main.dishNode.active = false;
                        this.main.resultAnimating = false;
                        this.main.updateRoundHistory();
                        this.main.showResult();
                        onFinishHanlingData();
                    })
                )
            );
        }
    }
}
