import GameBaseLogsHandler from '../../../_base/handlers/GameBaseLogsHandler';
import BigSmall from '../BigSmall';

export default class BigSmallLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: BigSmall) {
        super(main);
    }

    buildLogs(dataLogs) {
        if (dataLogs && dataLogs[0] && dataLogs[0].result) {
            this.main.setDices(dataLogs[0].result);
        }
        this.main.updateRoundHistory();
    }
}
