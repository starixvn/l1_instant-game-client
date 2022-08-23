import BaccaratCards, { OrderCard } from "./../../components/view-models/BaccaratCards";
import * as i18n from "i18n/runtime-scripts/LanguageData";
import * as _ from "lodash";

import { getLowercaseObjectKeys } from "../../../../common/helper/ObjectHelper";
import { updateOtherPlayerBalance } from "../../../_base/action/OtherPlayerAction";
import { payChips } from "../../../_base/action/PayChipsAction";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import WebSocketTableGameBase from "../../../_base/WebSocketTableGameBase";
import Baccarat from "../Baccarat";
import BaccaratLogsHandler from "./BaccaratLogsHandler";

export default class BaccaratFinishHandler extends GameBaseFinishHandler {
    handle(data: any): boolean {
        if (data.finish) {
            this.main.finishShowResult = false;
            this.main.node.activeInHierarchy && this.main.gameAudios.playEndGameAudio();
            this.setNewGameRound(data);
            const mainRoomGame = this.main as WebSocketTableGameBase;
            if (mainRoomGame && mainRoomGame.playerHandler) {
                updateOtherPlayerBalance(data.finish.winningPlayers, this.main);
            }
            this.handleFinishData(data.finish, () => {
                payChips(
                    this.main,
                    data.finish.settlementResult,
                    data.finish.winningPlayers,
                    this.payChipFlyTime,
                    this.WinningAnimationDuration
                );
                this.main.finishShowResult = true;
            });
        }

        return true;
    }

    handleFinishData(dataFinish: any, onFinishHandlingData: () => void = null) {
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

    protected async showCards(dataFinish: any, baccaratMain: Baccarat, onFinishHandlingData: () => void) {
        // baccaratMain.showScoreBoardNextDot = true;
        const cardUI = baccaratMain.cardsUI;
        const result = dataFinish.result;
        const settlementResult = dataFinish.settlementResult;
        const playerCards: any = this.getDataFollowTypePlayer(result, false);
        const bankerCards: any = this.getDataFollowTypePlayer(result, true);
        const showResultFunc = () => {
            // baccaratMain.showScoreBoardNextDot = false;
            this.showResult(settlementResult);
            this.showWinNotice(settlementResult);
            onFinishHandlingData && onFinishHandlingData();
            this.insertCurrentDataLogs(baccaratMain, dataFinish);
            baccaratMain.currentDataLogs.length > 102 && this.main.currentDataLogs.pop();
            (baccaratMain.logsHandler as BaccaratLogsHandler).buildLogs(baccaratMain.currentDataLogs);
            this.handleBuildMiniLogs(baccaratMain);
        };

        await cardUI.playerCards.faceUpCard(cardUI.playerCards.cards[OrderCard.card1], playerCards[OrderCard.card1]);
        await cardUI.bankerCards.faceUpCard(cardUI.bankerCards.cards[OrderCard.card1], bankerCards[OrderCard.card1]);
        await cardUI.playerCards.faceUpCard(cardUI.playerCards.cards[OrderCard.card2], playerCards[OrderCard.card2]);
        await cardUI.bankerCards.faceUpCard(cardUI.bankerCards.cards[OrderCard.card2], bankerCards[OrderCard.card2]);

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
        cardPunter.cards[OrderCard.card3].opacity = 255;
        await cardPunter.flyCard({
            card: cardPunter.cards[OrderCard.card3],
            delay: 0.4,
            start: reserveCards.cards[isFlyPlayer ? OrderCard.card2 : OrderCard.card1],
            isReserve: true,
            numberTag: isFlyPlayer ? 6 : 5
        });
        await cardPunter.faceUpCard(cardPunter.cards[OrderCard.card3], cardData[OrderCard.card3]);
    }

    protected getDataFollowTypePlayer(data: any, isBanker: boolean) {
        if (isBanker) {
            return Object.values(data.banker).filter((value) => value != null);
        }
        return Object.values(data.player).filter((value) => value != null);
    }

    protected insertCurrentDataLogs(baccaratMain: any, dataFinish: any) {
        if (dataFinish.winningPlayers) {
            delete dataFinish.winningPlayers;
        }

        baccaratMain.currentDataLogs.unshift(dataFinish);
    }

    protected handleBuildMiniLogs(baccaratMain: any) {
        // nothing
    }

    public showResult(resultData, isAnimated = true): void {
        const keys = getLowercaseObjectKeys(resultData);

        _.forEach(this.main.betItems, (item) => item.setHighlight(resultData[keys[item.node.name.toLowerCase()]], isAnimated));
    }

    private showWinNotice(result) {
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
