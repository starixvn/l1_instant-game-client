import SedieRoundHistoryItem from "./SedieRoundHistoryItem";
import GameRoundHistory from "../../_base/view-models/GameRoundHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieRoundHistory extends GameRoundHistory {
    updateHistory(redData: any) {
        const data = [...redData];
        this.updateStatistic(data);
        data.reverse();
        const logData = data.map((d) => (d % 2 === 0 ? 0 : 1));
        this.logControl.setData(logData);
        const items = this.logControl.content.getComponentsInChildren(SedieRoundHistoryItem);
        items.forEach((item, i) => item.setValue(data[i]));
    }

    updateStatistic(redData: number[]) {
        const total = redData.length;

        if (total === 0) {
            this.updateStatisticLabels([0, 0]);
            return;
        }

        let oddCount = 0;
        redData.forEach((i) => {
            switch (i) {
                case 1:
                case 3:
                    oddCount++;
                    break;
            }
        });

        const evenCount = 100 - oddCount;

        if (oddCount > evenCount) {
            const oddPercent = Math.floor((oddCount * 100) / total);
            this.updateStatisticLabels([100 - oddPercent, oddPercent]);
        } else {
            const evenPercent = Math.floor((evenCount * 100) / total);
            this.updateStatisticLabels([evenPercent, 100 - evenPercent]);
        }
    }
}
