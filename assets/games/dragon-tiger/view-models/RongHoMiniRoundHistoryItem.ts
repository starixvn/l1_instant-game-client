import MiniRoundHistoryItem from "../../../common/control/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RongHoMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    whiteDot: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    blackDot: cc.SpriteFrame = null;

    protected readonly betTypes = ["dragon", "tiger", "tie"];

    public setData(data: any) {
        this.data = data;
        this.icon.spriteFrame = data.settlementResult[this.betTypes[0]] ? this.blackDot : this.whiteDot;
    }
}
