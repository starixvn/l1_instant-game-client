import { GameBaseStatusHandler } from "../../../_base/handlers/GameBaseStatusHandler";
import Sedie from "../Sedie";

export default class SedieStatusHandler extends GameBaseStatusHandler {
    constructor(protected readonly main: Sedie) {
        super(main);
    }

    handle(data: any): boolean {
        if (data.status) {
            if (this.currentStatusData && this.currentStatusData.win) {
                if (data.status.win) {
                    this.currentStatusData.bet += data.status.bet;
                }
            } else {
                this.currentStatusData = data.status;
            }
        }

        return true;
    }
}
