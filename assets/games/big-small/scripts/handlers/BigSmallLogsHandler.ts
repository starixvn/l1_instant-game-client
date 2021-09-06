import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import BigSmall from "../BigSmall";
import BigSmallTimeHandler from "./BigSmallTimeHandler";

export default class BigSmallLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: BigSmall) {
        super(main);
    }

    buildLogs(dataLogs) {
        if (this.main.timeHandler.isInWaitTime) {
            this.main.setDices(dataLogs[0].result);

            const timeHandler = this.main.timeHandler as BigSmallTimeHandler;
            const isBalanceBetTime = timeHandler.isInBalanceBetTime;
            if (isBalanceBetTime) {
                this.main.showBalanceBetNotice();
            } else {
                this.main.showResult(false);
            }
        }
        this.main.updateRoundHistory();
        this.main.highlightLastResult();
    }
}
