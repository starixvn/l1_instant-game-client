import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseUmDataHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any): boolean {
        if (!data.um) {
            return false;
        }

        this.main.isGoingToDisabled = true;

        if (this.main.currentTimeRemaining <= this.main.config.betTime || data.remainingTime === this.main.config.fullTime) {
            this.main.showUmMessage(data);
            this.main.disableGame();

            return true;
        }

        return false;
    }
}
