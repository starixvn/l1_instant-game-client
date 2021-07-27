import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseLogsHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any): boolean {
        if (data.roundId) {
            this.main.roundId = data.roundId;
        }

        if (data.roundHistory) {
            this.main.currentDataLogs = data.roundHistory;
            if (this.main.currentDataLogs.length > 0) {
                this.buildLogs(this.main.currentDataLogs);
            }
        }

        return true;
    }

    buildLogs(dataLogs) {}
}
