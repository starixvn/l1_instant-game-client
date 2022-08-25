import Baccarat from "../Baccarat";
import BaccaratLogsHandler from "./BaccaratLogsHandler";
import BaccaratFinishHandler from "./BaccaratFinishHandler";
import GameBaseTimeHandler from "../../../_base/handlers/GameBaseTimeHandler";
import { OrderCardIndex } from "../../components/view-models/BaccaratCards";
import { FinishResult } from "../../BaccaratType";

export default class BaccaratTimeDataHandler extends GameBaseTimeHandler {
    protected dealCardsTime = 2;

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.main.config.betTime + this.dealCardsTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.main.config.betTime + this.dealCardsTime;
    }

    get isInRoundTime() {
        return this.main.currentTimeRemaining >= this.main.config.minBetTime && this.main.currentTimeRemaining <= this.main.config.betTime;
    }

    get isInEndTime() {
        return this.main.currentTimeRemaining < this.main.config.minBetTime;
    }

    get isClearBet() {
        return (
            this.main.currentTimeRemaining >= this.main.config.betTime &&
            this.main.currentTimeRemaining < this.main.config.betTime + this.dealCardsTime
        );
    }

    protected getOwnMain(): Baccarat {
        return this.main as Baccarat;
    }

    gameUpdate(): void {
        if (this.isInWaitTime) {
            this.handleWaitTime();
        } else {
            this.handleNotWaitTime();
        }
        this.main.currentTimeRemaining--;
    }

    handleNotWaitTime() {
        if (this.isStartingNewGameRound) {
            this.handleStartingNewGameRound();
        }
        if (this.isClearBet) {
            this.main.resetDataAndUI();
        }

        if (this.isInRoundTime) {
            this.handleInRoundTime();

            if (this.isInLockBetTime) {
                if (this.main.currentTimeRemaining === this.main.config.stopBetTime) {
                    this.handleAtLockBetTime();
                }
                this.handleInLockBetTime();
            }
        } else {
            if (this.isInEndTime) {
                this.handleInEndTime();
            }
        }
    }

    async handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        await this.handleFlyCards();
    }

    async handleFlyCards() {
        const baccarat = this.getOwnMain();
        const cardsUI = baccarat.cardsUI;

        cardsUI.bankerCards.resetCards();
        cardsUI.playerCards.resetCards();
        cardsUI.reserveCards.resetCards();
        this.main.setGameRound(this.main.roundId);

        await cardsUI.playerCards.flyCard({
            card: cardsUI.playerCards.cards[OrderCardIndex.card1],
            delay: cardsUI.playerCards.durationFlyCard
        });
        await cardsUI.bankerCards.flyCard({
            card: cardsUI.bankerCards.cards[OrderCardIndex.card1],
            delay: cardsUI.playerCards.durationFlyCard
        });

        await cardsUI.playerCards.flyCard({
            card: cardsUI.playerCards.cards[OrderCardIndex.card2],
            delay: cardsUI.playerCards.durationFlyCard
        });
        await cardsUI.bankerCards.flyCard({
            card: cardsUI.bankerCards.cards[OrderCardIndex.card2],
            delay: cardsUI.bankerCards.durationFlyReserveCard
        });

        await cardsUI.playerCards.flyCard({
            card: cardsUI.reserveCards.cards[OrderCardIndex.card1],
            delay: cardsUI.bankerCards.durationFlyReserveCard
        });
        await cardsUI.bankerCards.flyCard({
            card: cardsUI.reserveCards.cards[OrderCardIndex.card2],
            delay: cardsUI.bankerCards.durationFlyReserveCard
        });

        if (this.main.currentDataLogs[0]) {
            const currentData = this.main.currentDataLogs[0];
            const finishHandler = this.main.finishHandler as BaccaratFinishHandler;
            finishHandler.showResult(this.getSettlementResult(currentData), false);
        }
    }

    handleInLockBetTime() {
        super.handleInLockBetTime();
        this.main.betItems.forEach((item) => item.setHighlight(false));

        if (this.main.currentTimeRemaining <= this.main.config.stopBetTime && this.main.currentDataLogs.length >= 102) {
            this.main.currentDataLogs.pop();
            (this.main.logsHandler as BaccaratLogsHandler).buildLogs();
        }
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(
            this.main.currentTimeRemaining - this.main.config.betTime - this.dealCardsTime - 1
        );
    }

    protected getSettlementResult(currentData: FinishResult) {
        return currentData.settlementResult;
    }
}
