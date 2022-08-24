import { CardData, OrderCard } from "./../../components/view-models/BaccaratCards";
import GameBaseLogsHandler from "../../../_base/handlers/GameBaseLogsHandler";
import Baccarat from "../Baccarat";

import BaccaratFinishHandler from "./BaccaratFinishHandler";
import SocketIOMiniGameBase from "../../../_base/SocketIOMiniGameBase";

export default class BaccaratLogsHandler extends GameBaseLogsHandler {
    constructor(protected readonly main: SocketIOMiniGameBase) {
        super(main);
    }

    handle(data: any): boolean {
        super.handle(data);
        const cardUI = this.getOwnMain().cardsUI;
        cardUI.reserveCards.showCardsJoinGame();
        cardUI.playerCards.showCardsJoinGame();
        cardUI.bankerCards.showCardsJoinGame();
        if (data.roundHistory && data.roundHistory[0]) {
            const lastLog = data.roundHistory[0];
            const settlementResult = this.getSettlementResult(lastLog);
            const finishHandler = this.getOwnFinishHandle();

            if (this.main.timeHandler.isInWaitTime) {
                const playerCards = this.getLogDataFollowTypePlayer(false, lastLog);
                const bankerCards = this.getLogDataFollowTypePlayer(true, lastLog);

                cardUI.playerCards.showCardsWithoutAnimation(playerCards as CardData[]);
                cardUI.bankerCards.showCardsWithoutAnimation(bankerCards as CardData[]);
                this.handleShowCardsJoinRoom(playerCards, bankerCards, cardUI);
                finishHandler.showWinNotice(settlementResult);
            }

            if (this.main.currentTimeRemaining > this.main.config.stopBetTime) {
                finishHandler.showResult(settlementResult, false);
            }
        }

        return true;
    }

    private handleShowCardsJoinRoom(playerCards, bankerCards, cardUI) {
        if (playerCards.length === 2 && bankerCards.length === 2) {
            cardUI.reserveCards.showCardsJoinGame();
        }

        if (playerCards.length === 3 && bankerCards.length === 3) {
            cardUI.reserveCards.resetCards(false);
        }

        if (playerCards.length === 3 || bankerCards.length === 3) {
            cardUI.reserveCards.resetCard(cardUI.reserveCards.cards[OrderCard.card1]);
        }
    }

    protected getLogDataFollowTypePlayer(isBanker: boolean, data: any) {
        const resultTmp = data.result;
        if (isBanker) {
            return Object.values(resultTmp.banker).filter((value) => value != null);
        }
        return Object.values(resultTmp.player).filter((value) => value != null);
    }

    protected getOwnMain(): Baccarat {
        return this.main as Baccarat;
    }

    protected getOwnFinishHandle(): any {
        const ownMain = this.getOwnMain();
        return ownMain.finishHandler as BaccaratFinishHandler;
    }

    protected getSettlementResult(lastLog: any) {
        return lastLog.settlementResult;
    }

    buildLogs() {
        this.getOwnMain().updateRoundHistory();
    }
}
