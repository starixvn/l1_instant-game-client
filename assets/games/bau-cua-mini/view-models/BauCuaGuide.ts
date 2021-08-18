import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameGuideBase from "../../_base/view-models/GameGuideBase";

const { ccclass } = cc._decorator;

@ccclass
export default class BauCuaGuide extends GameGuideBase {
    createReplaceData(configs) {
        return {
            _maxBetRound: numberWithCommas(Math.min(cc.GameManager.userStakeLevel.maxBet, configs.maxbet)),
            _minBet: numberWithCommas(configs.minbet),
            _maxBet: numberWithCommas(configs.maxbet)
        };
    }
}
