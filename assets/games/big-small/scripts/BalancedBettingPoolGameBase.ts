import * as _ from "lodash";

import GameUtils from "../../../common/utils/GameUtils";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import BalancedBettingPoolBetItem from "../../_base/view-models/BalancedBettingPoolBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class BalancedBettingPoolGameBase extends SocketIOMiniGameBase {
    @property(cc.Node)
    balanceBetNoticeContainer: cc.Node = null;

    @property(cc.Prefab)
    balanceBetNoticePrefab: cc.Prefab = null;

    protected betPercentages: { [choice: string]: cc.Label };

    public totalBets: { [choice: string]: number };

    showBetPercentage(choice: string, percent: number) {
        const label = this.betPercentages[choice];
        label.string = `${percent}%`;
    }

    resetDataAndUI() {
        super.resetDataAndUI();

        _.values(this.betPercentages).forEach((label) => {
            label.string = "0%";
        });
        this.hideBalanceBetNotice();
    }

    balanceBet() {
        const totalBets = _.values(this.totalBets);
        const balancedBetAmount = Math.min(...[totalBets[0] ?? 0, totalBets[1] ?? 0]);
        this.betItems.forEach((item) => (item as BalancedBettingPoolBetItem).balanceBet(GameUtils.getValueByCurrency(balancedBetAmount)));
    }

    showBalanceBetNotice() {
        const balanceBetNotice = cc.instantiate(this.balanceBetNoticePrefab);
        this.balanceBetNoticeContainer.addChild(balanceBetNotice);
        this.balanceBet();
    }

    hideBalanceBetNotice() {
        this.balanceBetNoticeContainer.destroyAllChildren();
    }

    public highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime || this.timeHandler.isInWaitTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];
        dataLog && this.highlightWonItems(dataLog.settlementResult, false);
    }

    private highlightWonItems(settlementResult: any, isAnimated = true) {
        this.betItems.forEach((betItem) => {
            betItem.setHighlight(settlementResult[betItem.node.name], isAnimated);
        });
    }
}
