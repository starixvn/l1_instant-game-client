import MiniRoundHistoryTip from "../../../common/control/mini-round-history/MiniRoundHistoryTip";
import GameUtils from "../../../common/utils/GameUtils";

const { ccclass } = cc._decorator;

@ccclass
export default class BigSmallRoundHistoryTip extends MiniRoundHistoryTip {
    protected readonly betTypes = ["big", "small"];

    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        const key = data.settlementResult[this.betTypes[0]] ? this.betTypes[0] : this.betTypes[1];
        const message = GameUtils.getBetChoiceString(key).toUpperCase();
        this.result.string = `${message} (${data.result.dice1}-${data.result.dice2}-${data.result.dice3})`;
    }
}
