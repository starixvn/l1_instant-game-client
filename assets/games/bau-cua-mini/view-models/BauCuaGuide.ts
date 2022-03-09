import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameGuideBase from "../../_base/view-models/GameGuideBase";

const { ccclass } = cc._decorator;

@ccclass
export default class BauCuaGuide extends GameGuideBase {
    createReplaceData(configs) {
        return {
            _maxBetRound: numberWithCommas(this.getMaxBet()),
            _minBet: numberWithCommas(this.getMinBet()),
            _maxBet: numberWithCommas(this.getMaxBet())
        };
    }
}
