import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseErrorHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any): boolean {
        if (data.apiError) {
            return true;
        }

        if (data.err) {
            this.main.showMiniWarning(data.err);
            return true;
        }

        return false;
    }
}
