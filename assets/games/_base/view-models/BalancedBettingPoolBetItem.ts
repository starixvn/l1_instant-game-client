import { numberTo } from "../../../common/helper/NumberHelper";
import BetItem from "./BetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class BalancedBettingPoolBetItem extends BetItem {
    public setHighlight(highlight: boolean, isAnimated = true) {
        super.setHighlight(highlight, isAnimated);

        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
    }

    public resetHighlight() {
        this.highlight.active = false;
    }

    public balanceBet(bet: number) {
        numberTo(this.totalBet, 0, bet, 1000, true);
    }
}
