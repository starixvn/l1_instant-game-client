import { numberWithCommas } from "../../../../common/helper/NumberHelper";
import GameGuideBase from "../../../_base/view-models/GameGuideBase";
import { GameConfig } from "../../BaccaratType";

const { ccclass } = cc._decorator;

@ccclass
export default class BaccaratGuide extends GameGuideBase {
    createReplaceData(configs: GameConfig) {
        return {
            _maxBetRound: numberWithCommas(this.getMaxBet()),
            _maxBetPlayer: numberWithCommas(this.getMaxBetForChoice(configs.maxBetPerChoices.player)),
            _maxBetTie: numberWithCommas(this.getMaxBetForChoice(configs.maxBetPerChoices.tie)),
            _minBet: this.getMinBet(),
            _maxBet: numberWithCommas(this.getMaxBet())
        };
    }
}
