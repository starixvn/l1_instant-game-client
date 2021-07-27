import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import Sedie from "../Sedie";

export default class SedieLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: Sedie) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.updateRoundHistory();
    }
}
