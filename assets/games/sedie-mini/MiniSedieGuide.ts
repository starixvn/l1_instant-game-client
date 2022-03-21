import { numberWithCommas } from "../../common/helper/NumberHelper";
import GameGuideBase from "../_base/view-models/GameGuideBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedieGuide extends GameGuideBase {
    createReplaceData(configs) {
        const { odds, maxBetPerChoices } = configs;

        return {
            _oddsMain: odds.even,
            _oddsRed4: odds.red4,
            _oddsRed3: odds.red3,
            _minBet: numberWithCommas(this.getMinBet()),
            _maxBetMain: numberWithCommas(this.getMaxBetForChoice(maxBetPerChoices.even)),
            _maxBetRed4: numberWithCommas(this.getMaxBetForChoice(maxBetPerChoices.red4)),
            _maxBetRed3: numberWithCommas(this.getMaxBetForChoice(maxBetPerChoices.red3)),
            _maxBetRound: numberWithCommas(this.getMaxBet())
        };
    }
}
