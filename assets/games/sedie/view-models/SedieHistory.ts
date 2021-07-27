import { numberWithCommas } from "../../../common/helper/NumberHelper";
import SedieHistoryBase from "../../_base/view-models/SedieHistoryBase";
import SedieHistoryItem from "./SedieHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistory extends SedieHistoryBase {
    bindItemRowData(betLog, index) {
        const itemNode = this.bindCommonData(betLog, index);
        const item = itemNode.getComponent(SedieHistoryItem);

        const { freeBet, settlementResult } = betLog;

        Object.keys(settlementResult).forEach((choice) => {
            const historyItem = item[choice];
            historyItem.string = freeBet ? 0 : numberWithCommas(betLog[choice]);

            if (settlementResult[choice]) {
                historyItem.node.color = cc.Color.YELLOW;
            } else {
                historyItem.node.color = cc.Color.WHITE;
            }
        });

        this.content.addChild(itemNode);

        item.betLog = betLog;
    }
}
