import MiniRoundHistoryTip from "../../../../common/control/mini-round-history/MiniRoundHistoryTip";

import GameUtils from "../../../../common/utils/GameUtils";

const { ccclass, property } = cc._decorator;

type itemType = {
    card: number;
    type: number;
};

@ccclass
export default class BaccaratMiniRoundHistoryTip extends MiniRoundHistoryTip {
    protected readonly betTypes = ["banker", "player", "tie"];

    public getWinItem(settlementResult: any): number {
        for (let i = 0; i < this.betTypes.length; i++) {
            if (settlementResult[this.betTypes[i]]) {
                return i;
            }
        }
        return -1;
    }

    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        const player = Object.values(data.result.player);
        const banker = Object.values(data.result.banker);

        let totalPlayer = 0;
        let totalBanker = 0;
        player.forEach((item: itemType) => {
            item && (totalPlayer += this.setValueCard(item.card + 1));
        });

        banker.forEach((item: itemType) => {
            item && (totalBanker += this.setValueCard(item.card + 1));
        });

        const playerText = GameUtils.getBetChoiceString("player");
        const bankerText = GameUtils.getBetChoiceString("banker");
        this.result.string = `${playerText}: ${this.setPoint(totalPlayer)} - ${bankerText}: ${this.setPoint(totalBanker)}`;
    }

    private setPoint(point) {
        return point % 10;
    }

    private setValueCard(value: number) {
        return value >= 10 ? 0 : value;
    }
}
