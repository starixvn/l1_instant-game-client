import { GameBaseStatusHandler } from '../../../_base/handlers/GameBaseStatusHandler';
import BigSmall from '../BigSmall';

export default class BigSmallStatusHandler extends GameBaseStatusHandler {
    constructor(protected readonly main: BigSmall) {
        super(main);
    }

    handle(data: any): boolean {
        if (data.status) {
            this.currentStatusData = data.status;
        }

        return true;
    }
}
