import MiniRoundHistoryTip from "../../../common/control/mini-round-history/MiniRoundHistoryTip";
import GameUtils from "../../../common/utils/GameUtils";
const { ccclass, property } = cc._decorator;

@ccclass
export default class RongHoMiniRoundHistoryTip extends MiniRoundHistoryTip {
    protected readonly betTypes = ["dragon", "tiger", "tie"];

    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        // const choiceColors = [new cc.Color(219, 185, 0), cc.Color.RED, new cc.Color(63, 111, 123)];
        // const message = GameUtils.getBetChoiceString(choiceNames[winChoice]).toUpperCase();
        // this.result.string = message;
        // this.result.node.color = choiceColors[winChoice];

        // const dragon = result.dragon;
        // const tiger = result.tiger;
        // this.dragon.string = getNameCard(dragon.card);
        // this.dragonType.spriteFrame = this.cardTypeSprite[dragon.type];
        // this.tiger.string = getNameCard(tiger.card);
        // this.tigerType.spriteFrame = this.cardTypeSprite[tiger.type];
    }
}
