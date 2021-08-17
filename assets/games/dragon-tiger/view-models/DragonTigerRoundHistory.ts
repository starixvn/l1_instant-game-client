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

        let dragonCount = 0,
            drawCount = 0;

        roundHistoryData.forEach((log) => {
            switch (log) {
                case 0:
                    dragonCount++;
                    break;
                case 2:
                    drawCount++;
                    break;
            }
        });

        const dragonStats = Math.floor((dragonCount * 100) / total);
        const drawStats = Math.floor((drawCount * 100) / total);
        const tigerStats = 100 - (dragonStats + drawStats);

        this.updateStatisticLabels([dragonStats, tigerStats, drawStats]);
    }
}
