import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameGuideBase from "../../_base/view-models/GameGuideBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonTigerGuide extends GameGuideBase {
    createReplaceData(configs) {
        return {
            _maxBetRound: numberWithCommas(configs.maxBet),
            _maxBetDragon: numberWithCommas(configs.maxBetPerChoices.dragon),
            _maxBetTie: numberWithCommas(configs.maxBetPerChoices.tie),
            _minBet: configs.minBet,
            _maxBet: numberWithCommas(configs.maxBet)
        };
    }
}
