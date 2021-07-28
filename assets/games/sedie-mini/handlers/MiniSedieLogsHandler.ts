import GameBaseLogsHandler from "../../_base/handlers/GameBaseLogsHandler";
import MiniSedie from "../MiniSedie";

export default class MiniSedieLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: MiniSedie) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.updateRoundHistory();
        this.main.showRoundHistory(true);
        this.main.highlightLastResult();
    }
}
