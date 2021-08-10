import * as _ from "lodash";

import { BetInfo } from "../../../common/control/ber-board/BetBoard";
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

    onAcceptedBet(info: BetInfo) {
        const { choice, bet } = info;

        if (!this.validateBet()) {
            return;
        }

        this.sendBetRequest(choice, bet);
    }

    validateBet() {
        if (!this.isReadyBet()) {
            return false;
        }

        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
            return false;
        } else {
            this.lockBet();
            return true;
        }
    }

    sendBetRequest(choice: string, amount: number) {
        const betData = {
            amount: amount,
            betChoice: choice
        };
        this.socket && this.socket.connected && this.socket.emit("bet", betData);
    }

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
        this.betItems.forEach((item) => (item as BalancedBettingPoolBetItem).balanceBet(balancedBetAmount));
    }

    showBalanceBetNotice() {
        const balanceBetNotice = cc.instantiate(this.balanceBetNoticePrefab);
        this.balanceBetNoticeContainer.addChild(balanceBetNotice);
        this.balanceBet();
    }

    hideBalanceBetNotice() {
        this.balanceBetNoticeContainer.destroyAllChildren();
    }
}
