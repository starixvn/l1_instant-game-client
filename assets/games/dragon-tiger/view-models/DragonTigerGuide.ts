import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameGuideBase from "../../_base/view-models/GameGuideBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonTigerGuide extends GameGuideBase {
    createReplaceData(configs) {
        return {
            _maxBetRound: numberWithCommas(configs.maxbet),
            _maxBetDragon: numberWithCommas(configs.choices_maxbet.dragon),
            _maxBetTie: numberWithCommas(configs.choices_maxbet.tie),
            _minBet: configs.minbet,
            _maxBet: numberWithCommas(configs.maxbet)
        };
    }
}
