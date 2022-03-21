import { numberWithCommas } from "../../../common/helper/NumberHelper";
import GameGuideBase from "../../_base/view-models/GameGuideBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonTigerGuide extends GameGuideBase {
    createReplaceData(configs) {
        return {
            _maxBetRound: numberWithCommas(this.getMaxBet()),
            _maxBetDragon: numberWithCommas(this.getMaxBetForChoice(configs.maxBetPerChoices.dragon)),
            _maxBetTie: numberWithCommas(this.getMaxBetForChoice(configs.maxBetPerChoices.tie)),
            _minBet: this.getMinBet(),
            _maxBet: numberWithCommas(this.getMaxBet())
        };
    }
}
