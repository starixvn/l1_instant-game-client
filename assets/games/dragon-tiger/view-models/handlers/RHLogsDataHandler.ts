import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import DragonTiger from "../DragonTiger";

export default class RHLogsDataHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: DragonTiger) {
        super(main);
    }

    buildLogs(dataLogs: any) {
        this.main.updateRoundHistory();
    }
}
