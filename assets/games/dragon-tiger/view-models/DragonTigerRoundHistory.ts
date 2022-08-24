import GameRoundHistory from "../../_base/view-models/GameRoundHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonTigerRoundHistory extends GameRoundHistory {
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
