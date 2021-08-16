import GameBaseTimeHandler from '../../../_base/handlers/GameBaseTimeHandler';
import BauCua from '../BauCua';

export default class BauCuaTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: BauCua) {
        super(main);
    }

    handleInRoundTime() {
        super.handleInRoundTime();
        this.main.hideAllDices();
        this.main.animationNode.node.active = false;
    }
}
