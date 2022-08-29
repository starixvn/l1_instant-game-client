import GameRoundHistory from "../../../_base/view-models/GameRoundHistory";
import Baccarat from "../../view-models/Baccarat";

const { ccclass } = cc._decorator;

@ccclass
export default class BaccaratRoundHistory extends GameRoundHistory {
    protected main: Baccarat = null;
    public init(main: Baccarat) {
        this.main = main;

        const condition = () => {
            return this.main.currentTimeRemaining < this.main.config.stopBetTime || this.main.showScoreBoardNextDot;
        };
        this.logControl && this.logControl.init(condition);
    }

    updateStatistic(roundHistoryData) {
        const total = roundHistoryData.length;

        if (total === 0) {
            this.updateStatisticLabels([0, 0, 0]);
            return;
        }

        let playerCount = 0,
            bankerCount = 0;

        roundHistoryData.forEach((log) => {
            switch (log) {
                case 0:
                    playerCount++;
                    break;
                case 2:
                    bankerCount++;
                    break;
            }
        });

        const playerStats = Math.floor((playerCount * 100) / total);
        const tieStats = Math.floor((bankerCount * 100) / total);
        const bankerStats = 100 - (playerStats + tieStats);

        this.updateStatisticLabels([playerStats, bankerStats, tieStats]);
    }
}
