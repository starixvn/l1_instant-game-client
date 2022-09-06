import { OrderCardIndex } from "./../../components/view-models/BaccaratCards";
import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import Baccarat from "../Baccarat";

import BaccaratFinishHandler from "./BaccaratFinishHandler";
import { FinishResult } from "../../BaccaratType";
import BaccaratCardsUI from "../../components/view-models/BaccaratCardsUI";

export default class BaccaratLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: Baccarat) {
        super(main);
    }

    handle(data): boolean {
        super.handle(data);

        if (data.roundHistory) {
            const cardsUI = this.main.cardsUI;
            cardsUI.resetUI();
            if (data.roundHistory[0]) {
                const lastLog = data.roundHistory[0];
                const settlementResult = this.getSettlementResult(lastLog);
                const finishHandler = this.getOwnFinishHandle();
                if (this.main.timeHandler.isInWaitTime) {
                    const playerCards = this.getLogDataFollowTypePlayer(false, lastLog);
                    const bankerCards = this.getLogDataFollowTypePlayer(true, lastLog);

                    cardsUI.playerCards.showCardsWithoutAnimation(playerCards);
                    cardsUI.bankerCards.showCardsWithoutAnimation(bankerCards);

                    this.handleShowCardsJoinRoom(playerCards.length, bankerCards.length, cardsUI);
                    finishHandler.showWinNotice(settlementResult);
                    this.main.finishShowResult = true;
                }

                if (this.main.currentTimeRemaining > this.main.config.stopBetTime) {
                    finishHandler.showResult(settlementResult, false);
                }
            }
        }

        return true;
    }

    private handleShowCardsJoinRoom(playerCardCount: number, bankerCardCount: number, cardUI: BaccaratCardsUI) {
        if (playerCardCount === 2 && bankerCardCount === 2) {
            return;
        }

        if (playerCardCount === 3 && bankerCardCount === 3) {
            cardUI.reserveCards.resetCards(false);
            return;
        }

        cardUI.reserveCards.resetCard(cardUI.reserveCards.cards[OrderCardIndex.card1]);
    }

    protected getLogDataFollowTypePlayer(isBanker: boolean, data: FinishResult) {
        const resultTmp = data.result;
        if (isBanker) {
            return Object.values(resultTmp.banker).filter((value) => value != null);
        }
        return Object.values(resultTmp.player).filter((value) => value != null);
    }

    protected getOwnFinishHandle(): BaccaratFinishHandler {
        return this.main.finishHandler as BaccaratFinishHandler;
    }

    protected getSettlementResult(lastLog: FinishResult) {
        return lastLog.settlementResult;
    }

    buildLogs() {
        this.main.updateRoundHistory();
    }
}
