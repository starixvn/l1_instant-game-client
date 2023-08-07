import MiniRoundHistoryTip from "../../../common/control/mini-round-history/MiniRoundHistoryTip";
import GameUtils from "../../../common/utils/GameUtils";
import { SicBoBetType } from "./SicBoCommon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoMiniRoundHistoryTip extends MiniRoundHistoryTip {
    protected readonly betTypes = ["big", "small", "anyTriple"];
    public setData(data: any) {
        const { settlementResult } = data;
        this.roundId.string = `#${data.roundId}`;
        let choiceResult = "";
        if (settlementResult[SicBoBetType.anyTriple]) {
            choiceResult = GameUtils.getText("ui.any_triple");
        } else {
            choiceResult = settlementResult[SicBoBetType.big] ? GameUtils.getText("ui.choice_big") : GameUtils.getText("ui.choice_small");
        }

        this.result.string = `${choiceResult} (${data.result.dice1}-${data.result.dice2}-${data.result.dice3})`;
        this.show();
    }
}
