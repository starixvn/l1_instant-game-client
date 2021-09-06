import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import DragonTiger from "../DragonTiger";

export default class RHLogsDataHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: DragonTiger) {
        super(main);
    }

    buildLogs(dataLogs: any) {
        this.main.updateRoundHistory();
        if (dataLogs.length > 0) {
            const lastResult = dataLogs[0].result;
            this.main.resultCards = [lastResult.dragon, lastResult.tiger];
        }
    }
}
