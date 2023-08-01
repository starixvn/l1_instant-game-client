import MiniRoundHistoryItem from "../../../common/control/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoMiniRoundHistoryItem extends MiniRoundHistoryItem {
    public setData(data: any) {
        this.data = data;
        this.node.color = data.settlementResult.big ? cc.Color.BLACK.fromHEX("#db1515") : cc.Color.BLACK.fromHEX("#2580f1");
    }
}
