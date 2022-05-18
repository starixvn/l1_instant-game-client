import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import BauCua from "../BauCua";

export default class BauCuaLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: BauCua) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.highlightWinningBetItems(false);
        this.main.resetUIBetItems();
        this.main.resetXTimesResult();

        if (this.main.currentTimeRemaining > this.main.config.betTime) {
            this.main.setDiceResult();
            this.main.updateRoundHistory();
            this.main.dishNode.active = false;
            this.main.finishShowResult = true;
        }
    }
}
