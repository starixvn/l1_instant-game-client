import BetChips from "./BetChips";
import HandleUserStakeLevel from "./HandleUserStakeLevel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VipBetChip extends BetChips {
    private needHandleStakeLevel: boolean;
    customizeCredit(): void {
        this.chipValues = [10, 20, 50, 100, 200, 500, 1000, 2000, 3000];
        this.needHandleStakeLevel = true;
    }

    customizeCash(): void {
        this.chipValues = [100, 200, 500, 1000, 2000, 5000, 10000, 20000];
        this.needHandleStakeLevel = false;
    }

    onLoad() {
        super.onLoad();
        if (this.needHandleStakeLevel) {
            this.node.addComponent(HandleUserStakeLevel);
        }
    }
}
