import { BetTypes, FinishResult, Settlement } from "./../../BaccaratType";
import MiniRoundHistoryItem from "../../../../common/control/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratMiniRoundHistoryItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property({ type: cc.SpriteFrame })
    itemSprites: cc.SpriteFrame[] = [];

    public getWinItem(settlementResult: Settlement): number {
        for (let i = 0; i < BetTypes.length; i++) {
            if (settlementResult[BetTypes[i]]) {
                return i;
            }
        }
        return -1;
    }

    public setData(data: FinishResult) {
        this.data = data;
        const winChoice = this.getWinItem(data.settlementResult);
        this.icon.spriteFrame = this.itemSprites[winChoice];
    }
}
