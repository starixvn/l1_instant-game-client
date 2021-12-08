import { numberWithCommas } from "../../common/helper/NumberHelper";
import GameGuideBase from "../_base/view-models/GameGuideBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedieGuide extends GameGuideBase {
    createReplaceData(configs) {
        const { odds, maxBetPerChoices, minBet, maxBet } = configs;

        return {
            _oddsMain: odds.even,
            _oddsRed4: odds.red4,
            _oddsRed3: odds.red3,
            _minBet: numberWithCommas(minBet),
            _maxBetMain: numberWithCommas(maxBetPerChoices.even),
            _maxBetRed4: numberWithCommas(maxBetPerChoices.red4),
            _maxBetRed3: numberWithCommas(maxBetPerChoices.red3),
            _maxBetRound: numberWithCommas(maxBet)
        };
    }
}
