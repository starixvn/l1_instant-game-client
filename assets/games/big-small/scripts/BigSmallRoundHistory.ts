import GameRoundHistory from "../../_base/view-models/GameRoundHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmallRoundHistory extends GameRoundHistory {
    updateStatistic(bigSmallData: number[]) {
        const total = bigSmallData.length;

        if (total === 0) {
            this.updateStatisticLabels([0, 0]);
            return;
        }
        const bigValue = bigSmallData.filter((value) => value > 0).length;
        const smallValue = total - bigValue;
        if (bigValue > smallValue) {
            const smallPercent = Math.floor((smallValue * 100) / total);
            this.updateStatisticLabels([100 - smallPercent, smallPercent]);
        } else {
            const bigPercent = Math.floor((bigValue * 100) / total);
            this.updateStatisticLabels([bigPercent, 100 - bigPercent]);
        }
    }
}
