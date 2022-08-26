import { OrderCardIndex } from "./../../components/view-models/BaccaratCards";
import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import Baccarat from "../Baccarat";

import BaccaratFinishHandler from "./BaccaratFinishHandler";
import SocketIOMiniGameBase from "../../../_base/SocketIOMiniGameBase";
import { FinishResult } from "../../BaccaratType";
import BaccaratCardsUI from "../../components/view-models/BaccaratCardsUI";

export default class BaccaratLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: SocketIOMiniGameBase) {
        super(main);
    }

    handle(data): boolean {
        super.handle(data);

        if (data.roundHistory) {
            const cardUI = this.getOwnMain().cardsUI;
            cardUI.playerCards.showCardsJoinGame();
            cardUI.bankerCards.showCardsJoinGame();
            cardUI.reserveCards.showCardsJoinGame();

            if (data.roundHistory[0]) {
                const lastLog = data.roundHistory[0];
                const settlementResult = this.getSettlementResult(lastLog);
                const finishHandler = this.getOwnFinishHandle();
                if (this.main.timeHandler.isInWaitTime) {
                    const playerCards = this.getLogDataFollowTypePlayer(false, lastLog);
                    const bankerCards = this.getLogDataFollowTypePlayer(true, lastLog);

                    cardUI.playerCards.showCardsWithoutAnimation(playerCards);
                    cardUI.bankerCards.showCardsWithoutAnimation(bankerCards);

                    this.handleShowCardsJoinRoom(playerCards.length, bankerCards.length, cardUI);
                    finishHandler.showWinNotice(settlementResult);
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
            cardUI.reserveCards.showCardsJoinGame();
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

    protected getOwnMain(): Baccarat {
        return this.main as Baccarat;
    }

    protected getOwnFinishHandle(): BaccaratFinishHandler {
        const ownMain = this.getOwnMain();
        return ownMain.finishHandler as BaccaratFinishHandler;
    }

    protected getSettlementResult(lastLog: FinishResult) {
        return lastLog.settlementResult;
    }

    buildLogs() {
        this.getOwnMain().updateRoundHistory();
    }
}
