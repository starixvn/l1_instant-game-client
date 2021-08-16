import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import GameGuideBase from "../../_base/view-models/GameGuideBase";

const { ccclass } = cc._decorator;

@ccclass
export default class BauCuaGuide extends GameGuideBase {
    createReplaceData(configs) {
        const { odds, choices_maxbet } = configs;

        return {
            _maxBetRound: numberWithCommas(Math.min(cc.RedT.userStakeLevel.maxBet, configs.maxbet)),
            _oddSingle: odds.single,
            _oddDouble: odds.double,
            _oddTriple: odds.triple,
            _minBet: numberWithCommas(configs.minbet),
            _maxBet: numberWithCommas(configs.maxbet),
            _maxChoiceRound: numberWithCommas(choices_maxbet.crab)
        };
    }
}
