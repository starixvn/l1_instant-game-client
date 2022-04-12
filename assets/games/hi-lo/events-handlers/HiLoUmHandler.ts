import GameBaseUmDataHandler from "../../_base/handlers/GameBaseUmDataHandler";
import HiLo from "../view-models/HiLo";
import { GameState } from "../../_base/GameState";

export default class HiLoUmHandler extends GameBaseUmDataHandler {
    constructor(protected readonly main: HiLo) {
        super(main);
    }

    handle(data: any): boolean {
        if (!data.um) {
            return false;
        }

        if (this.main.gameState !== GameState.Disabled) {
            this.main.showUmMessage(data);
            this.main.disableGame();
        }

        return true;
    }
}
