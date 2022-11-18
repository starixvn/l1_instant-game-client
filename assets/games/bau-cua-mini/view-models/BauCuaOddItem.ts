import { formatOdds, numberWithCommas } from "../../../common/helper/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCuaOddItem extends cc.Component {
    @property(cc.Label)
    value: cc.Label = null;

    setValue(value: string) {
        this.value.string = formatOdds(value, cc.GameManager?.user?.fractionalOddsFormat);
    }
}
