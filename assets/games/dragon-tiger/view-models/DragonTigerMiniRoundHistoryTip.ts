import MiniRoundHistoryTip from "../../../common/control/mini-round-history/MiniRoundHistoryTip";
import GameUtils from "../../../common/utils/GameUtils";
import { getNameCard } from "../../../common/helper/CardHelper";
const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonTigerMiniRoundHistoryTip extends MiniRoundHistoryTip {
    @property(cc.Label)
    dragon: cc.Label = null;

    @property(cc.Sprite)
    dragonType: cc.Sprite = null;

    @property(cc.Label)
    tiger: cc.Label = null;

    @property(cc.Sprite)
    tigerType: cc.Sprite = null;

    @property({ type: cc.SpriteFrame })
    cardTypeSprite: cc.SpriteFrame[] = [];

    protected readonly betTypes = ["dragon", "tiger", "tie"];

    public getWinItem(settlementResult: any): number {
        for (let i = 0; i < this.betTypes.length; i++) {
            if (settlementResult[this.betTypes[i]]) {
                return i;
            }
        }
        return -1;
    }

    public setData(data: any) {
        const result = data.result;
        const winChoice = this.getWinItem(data.settlementResult);
        const choiceColors = [new cc.Color(219, 185, 0), cc.Color.RED, new cc.Color(63, 111, 123)];

        this.roundId.string = `#${data.roundId}`;
        const message = GameUtils.getBetChoiceString(this.betTypes[winChoice]).toUpperCase();
        this.result.string = message;
        this.result.node.color = choiceColors[winChoice];

        const dragon = result.dragon;
        const tiger = result.tiger;
        this.dragon.string = getNameCard(dragon.card);
        this.dragonType.spriteFrame = this.cardTypeSprite[dragon.type];
        this.tiger.string = getNameCard(tiger.card);
        this.tigerType.spriteFrame = this.cardTypeSprite[tiger.type];
    }
}
