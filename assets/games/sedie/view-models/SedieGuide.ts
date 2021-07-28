import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameGuideBase from "../../_base/view-models/GameGuideBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieGuide extends GameGuideBase {
    createReplaceData(configs) {
        const { odds, choices_maxbet, minbet, maxbet } = configs;

        return {
            _oddsMain: odds.even,
            _oddsRed4: odds.red4,
            _oddsRed3: odds.red3,
            _oddsRed2: odds.red2,
            _minBet: numberWithCommas(minbet),
            _maxBetMain: numberWithCommas(Math.min(cc.GameManager.userStakeLevel.maxBet, maxbet, choices_maxbet.even)),
            _maxBetRed4: numberWithCommas(Math.min(cc.GameManager.userStakeLevel.maxBet, maxbet, choices_maxbet.red4)),
            _maxBetRed3: numberWithCommas(Math.min(cc.GameManager.userStakeLevel.maxBet, maxbet, choices_maxbet.red3)),
            _maxBetRed2: numberWithCommas(Math.min(cc.GameManager.userStakeLevel.maxBet, maxbet, choices_maxbet.red2)),
            _maxBetRound: numberWithCommas(Math.min(cc.GameManager.userStakeLevel.maxBet, maxbet))
        };
    }
}
