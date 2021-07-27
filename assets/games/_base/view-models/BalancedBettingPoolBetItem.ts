import { numberTo, numberWithCommas } from "../../../common/helper/NumberHelper";
import BetItem from "./BetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class BalancedBettingPoolBetItem extends BetItem {
    public resetHighlight() {
        this.resetHighlightOptions();
    }

    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        this.setHighlightItemsOptions(highlight, isAnimated);
    }

    public balanceBet(bet: number) {
        numberTo(this.totalBet, 0, bet, 1000, true);
    }

    protected setTotalBet(bet: number) {
        this.totalBet.string = numberWithCommas(bet);
    }
}
