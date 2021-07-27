import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameUtils from "../../../common/utils/GameUtils";
import FreeBetDetailItem from "./FreeBetDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeBetDetail extends cc.Component {
    @property(cc.Label)
    roundId: cc.Label = null;

    @property(cc.Sprite)
    resultSprite: cc.Sprite = null;

    @property(cc.Label)
    resultNumber: cc.Label = null;

    @property(cc.SpriteFrame)
    iconRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    iconWhite: cc.SpriteFrame = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Label)
    totalBet: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    init(betLog) {
        const { phien, betwin, result, settlementResult } = betLog;
        this.roundId.string = phien;

        let number = 0;
        Object.keys(result).forEach((key) => {
            if (result[key]) {
                number++;
            }
        });

        this.resultNumber.string = number.toString();
        if (number % 2) {
            this.resultSprite.spriteFrame = this.iconRed;
            this.resultNumber.node.color = cc.Color.WHITE;
        } else {
            this.resultSprite.spriteFrame = this.iconWhite;
            this.resultNumber.node.color = cc.Color.BLACK;
        }

        let totalBet = 0;
        Object.keys(settlementResult).forEach((key) => {
            if (betLog[key]) {
                const node = cc.instantiate(this.itemPrefab);
                const item = node.getComponent(FreeBetDetailItem);
                item.label.string = GameUtils.getBetChoiceString(key);
                item.value.string = numberWithCommas(betLog[key]);
                totalBet += betLog[key];

                this.content.addChild(node);
            }
        });

        this.totalBet.string = numberWithCommas(totalBet);
        this.win.string = numberWithCommas(betwin);
    }
}
