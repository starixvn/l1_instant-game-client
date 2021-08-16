import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import BauCua from "../BauCua";

export default class BauCuaLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: BauCua) {
        super(main);
    }

    buildLogs(dataLogs) {
        this.main.addLogs();
        this.main.highlightWinningBetItems(false);
        this.main.resetUIBetItems();
        this.main.resetXTimesResult();
        if (!this.main.finishShowResult) {
            this.main.setDiceResult();
            this.main.animationNode.node.active = true;
            const duration = this.main.animationNode.defaultClip.duration;
            this.main.animationNode.play("Result", duration);
            this.main.finishShowResult = true;
        }
    }
}
