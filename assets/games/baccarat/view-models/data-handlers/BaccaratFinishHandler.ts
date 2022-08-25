import BaccaratCards, { OrderCardIndex } from "./../../components/view-models/BaccaratCards";
import * as i18n from "i18n/runtime-scripts/LanguageData";

import { getLowercaseObjectKeys } from "../../../../common/helper/ObjectHelper";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import Baccarat from "../Baccarat";
import BaccaratLogsHandler from "./BaccaratLogsHandler";
import { FinishResult, Result, Settlement } from "../../BaccaratType";

export default class BaccaratFinishHandler extends GameBaseFinishHandler {
    handleFinishData(dataFinish: FinishResult, onFinishHandlingData: () => void = null) {
        super.handleFinishData(dataFinish, onFinishHandlingData);

        const baccaratMain = this.getOwnMain();
        if (!dataFinish.result) {
            return;
        }

        this.showCards(dataFinish, baccaratMain, onFinishHandlingData);
    }

    protected getOwnMain(): Baccarat {
        return this.main as Baccarat;
    }

    protected async showCards(dataFinish: FinishResult, baccaratMain: Baccarat, onFinishHandlingData: () => void) {
        const cardUI = baccaratMain.cardsUI;
        const result = dataFinish.result;
        const settlementResult = dataFinish.settlementResult;
        const playerCards = this.getDataFollowTypePlayer(result, false);
        const bankerCards = this.getDataFollowTypePlayer(result, true);
        const showResultFunc = () => {
            this.showResult(settlementResult);
            this.showWinNotice(settlementResult);
            onFinishHandlingData && onFinishHandlingData();
            this.insertCurrentDataLogs(baccaratMain, dataFinish);
            baccaratMain.currentDataLogs.length > 102 && this.main.currentDataLogs.pop();
            (baccaratMain.logsHandler as BaccaratLogsHandler).buildLogs();
        };

        await cardUI.playerCards.faceUpCard(cardUI.playerCards.cards[OrderCardIndex.card1], playerCards[OrderCardIndex.card1]);
        await cardUI.bankerCards.faceUpCard(cardUI.bankerCards.cards[OrderCardIndex.card1], bankerCards[OrderCardIndex.card1]);
        await cardUI.playerCards.faceUpCard(cardUI.playerCards.cards[OrderCardIndex.card2], playerCards[OrderCardIndex.card2]);
        await cardUI.bankerCards.faceUpCard(cardUI.bankerCards.cards[OrderCardIndex.card2], bankerCards[OrderCardIndex.card2]);

        let isFlyPlayer = false;
        if (playerCards.length === 3) {
            await this.handleFaceUpReserveCard(cardUI.playerCards, cardUI.reserveCards, playerCards);
            isFlyPlayer = true;
        }

        if (bankerCards.length === 3) {
            await this.handleFaceUpReserveCard(cardUI.bankerCards, cardUI.reserveCards, bankerCards, isFlyPlayer);
        }

        showResultFunc();
    }

    private async handleFaceUpReserveCard(cardPunter: BaccaratCards, reserveCards: BaccaratCards, cardData, isFlyPlayer = false) {
        await cardPunter.stackCard();
        cardPunter.cards[OrderCardIndex.card3].opacity = 255;
        await cardPunter.flyCard({
            card: cardPunter.cards[OrderCardIndex.card3],
            delay: reserveCards.durationFlyCard,
            start: reserveCards.cards[isFlyPlayer ? OrderCardIndex.card2 : OrderCardIndex.card1],
            isReserve: true,
            numberTag: isFlyPlayer ? 6 : 5
        });
        await cardPunter.faceUpCard(cardPunter.cards[OrderCardIndex.card3], cardData[OrderCardIndex.card3]);
    }

    protected getDataFollowTypePlayer(data: Result, isBanker: boolean) {
        if (isBanker) {
            return Object.values(data.banker).filter((value) => value != null);
        }
        return Object.values(data.player).filter((value) => value != null);
    }

    protected insertCurrentDataLogs(baccaratMain: Baccarat, dataFinish: FinishResult) {
        if (dataFinish.winningPlayers) {
            delete dataFinish.winningPlayers;
        }

        baccaratMain.currentDataLogs.unshift(dataFinish);
    }

    public showResult(resultData: Settlement, isAnimated = true) {
        const keys = getLowercaseObjectKeys(resultData);

        this.main.betItems.forEach((item) => item.setHighlight(resultData[keys[item.node.name.toLowerCase()]], isAnimated));
    }

    showWinNotice(result: Settlement) {
        const baccaratMain = this.getOwnMain();
        const winNoticeNode = baccaratMain.cardsUI.winningText.node.parent;
        let key = "";

        if (result.banker) {
            key = "banker_win";
            baccaratMain.cardsUI.bankerCards.showHighlightCards();
        } else if (result.player) {
            key = "player_win";
            baccaratMain.cardsUI.playerCards.showHighlightCards();
        } else {
            key = "tie_win";
        }

        baccaratMain.cardsUI.winningText.string = i18n.t(`ui.${key}`).toUpperCase();
        winNoticeNode.active = true;
    }
}
