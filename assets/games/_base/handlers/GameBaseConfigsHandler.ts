import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseConfigsHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any): boolean {
        if (!data.gameConfigs) {
            return false;
        }

        this.main.gameConfigs = data.gameConfigs;
        this.main.updateDisplayForRemoteConfig();
        return true;
    }
}
