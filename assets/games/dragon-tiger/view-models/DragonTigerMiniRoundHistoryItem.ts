import MiniRoundHistoryItem from "../../../common/control/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonTigerMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property({ type: cc.SpriteFrame })
    itemSprites: cc.SpriteFrame[] = [];

    protected readonly betTypes = ["dragon", "tiger", "tie"];

    public getWinItem(settlementResult: any): number {
        const dict = ["dragon", "tiger", "tie"];
        for (let i = 0; i < this.betTypes.length; i++) {
            if (settlementResult[dict[i]]) {
                return i;
            }
        }
        return -1;
    }

    public setData(data: any) {
        this.data = data;
        const winChoice = this.getWinItem(data.settlementResult);
        this.icon.spriteFrame = this.itemSprites[winChoice];
    }
}
