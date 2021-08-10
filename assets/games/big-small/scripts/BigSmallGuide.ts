import { numberWithCommas } from '../../../common/helpers/NumberHelper';
import GameGuideBase from '../../_base/view-models/GameGuideBase';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmallGuide extends GameGuideBase {
    createReplaceData(configs) {
        return {
            _maxBetRound: numberWithCommas(configs.maxbet),
            _minBet: configs.minbet,
            _maxBet: numberWithCommas(configs.maxbet),
            _oddEven: configs.odds.big
        };
    }
}
