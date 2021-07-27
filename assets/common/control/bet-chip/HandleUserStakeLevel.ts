import BetChips from "./BetChips";

const { ccclass } = cc._decorator;

@ccclass
export default class HandleUserStakeLevel extends cc.Component {
    public gameConfig = null;
    private readonly maxBet3k = 3000;
    private readonly maxBet5k = 5000;

    private betChips: BetChips;

    onLoad() {
        this.betChips = this.node.getComponent(BetChips);
        this.handle();
    }

    handle() {
        if (!this.gameConfig || !cc.RedT.userStakeLevel) {
            return;
        }

        const maxValueDisplay =
            Math.min(this.gameConfig.maxbet, cc.RedT.userStakeLevel.maxBet) >= this.maxBet5k ? this.maxBet5k : this.maxBet3k;

        this.betChips.updateLastChip(maxValueDisplay);
        this.betChips.updateSelectedChipValue();
    }
}
