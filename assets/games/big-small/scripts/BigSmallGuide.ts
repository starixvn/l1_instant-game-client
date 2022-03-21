import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameGuideBase from "../../_base/view-models/GameGuideBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmallGuide extends GameGuideBase {
    createReplaceData(configs) {
        return {
            _chipMax: numberWithCommas(this.getMaxBet()),
            _minBet: numberWithCommas(this.getMinBet()),
            _maxBet: numberWithCommas(this.getMaxBet())
        };
    }
}
