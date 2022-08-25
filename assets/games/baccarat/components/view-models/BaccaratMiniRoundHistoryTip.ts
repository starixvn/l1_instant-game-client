import MiniRoundHistoryTip from "../../../../common/control/mini-round-history/MiniRoundHistoryTip";

import GameUtils from "../../../../common/utils/GameUtils";
import { BetTypes, CardModel, FinishResult, Settlement } from "../../BaccaratType";

const { ccclass } = cc._decorator;

@ccclass
export default class BaccaratMiniRoundHistoryTip extends MiniRoundHistoryTip {
    public getWinItem(settlementResult: Settlement): number {
        for (let i = 0; i < BetTypes.length; i++) {
            if (settlementResult[BetTypes[i]]) {
                return i;
            }
        }
        return -1;
    }

    public setData(data: FinishResult) {
        this.roundId.string = `#${data.roundId}`;
        const player = Object.values(data.result.player);
        const banker = Object.values(data.result.banker);

        let totalPlayer = 0;
        let totalBanker = 0;
        player.forEach((item: CardModel) => {
            item && (totalPlayer += this.setValueCard(item.card + 1));
        });

        banker.forEach((item: CardModel) => {
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
