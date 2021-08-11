import { numberWithCommas } from '../../../common/helpers/NumberHelper';
import GameGuideBase from '../../_base/view-models/GameGuideBase';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RongHoGuide extends GameGuideBase {
    createReplaceData(configs) {
        return {
            _maxBetRound: numberWithCommas(configs.maxbet),
            _maxBetDragon: numberWithCommas(configs.choices_maxbet.dragon),
            _maxBetTie: numberWithCommas(configs.choices_maxbet.tie),
            _minBet: configs.minbet,
            _maxBet: numberWithCommas(configs.maxbet),
            _oddDragon: configs.odds.dragon,
            _oddTie: configs.odds.tie
        };
    }
}
