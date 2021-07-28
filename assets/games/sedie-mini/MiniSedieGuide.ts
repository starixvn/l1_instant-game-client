import { numberWithCommas } from "../../common/helper/NumberHelper";
import GameGuideBase from "../_base/view-models/GameGuideBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedieGuide extends GameGuideBase {
    createReplaceData(configs) {
        const { odds, choices_maxbet, minbet, maxbet } = configs;

        return {
            _oddsMain: odds.even,
            _oddsRed4: odds.red4,
            _oddsRed3: odds.red3,
            _minBet: numberWithCommas(minbet),
            _maxBetMain: numberWithCommas(choices_maxbet.even),
            _maxBetRed4: numberWithCommas(choices_maxbet.red4),
            _maxBetRed3: numberWithCommas(choices_maxbet.red3),
            _maxBetRound: numberWithCommas(maxbet)
        };
    }
}
