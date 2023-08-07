import MiniRoundHistoryItem from "../../../common/control/mini-round-history/MiniRoundHistoryItem";
import { SicBoBetType } from "./SicBoCommon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoMiniRoundHistoryItem extends MiniRoundHistoryItem {
    public setData(data: any) {
        const { settlementResult } = data;
        this.data = data;
        const color = cc.Color.WHITE;
        if (settlementResult[SicBoBetType.anyTriple]) {
            this.node.color = color.fromHEX("#F3BC0F");
        } else {
            this.node.color = settlementResult[SicBoBetType.big] ? color.fromHEX("#db1515") : color.fromHEX("#2580f1");
        }
    }
}
