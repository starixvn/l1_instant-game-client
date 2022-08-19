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

    protected showCards(dataFinish: any, baccaratMain: Baccarat, onFinishHandlingData: () => void) {
        // baccaratMain.showScoreBoardNextDot = true;
        const result = dataFinish.result;
        const settlementResult = dataFinish.settlementResult;
        const playerCards = this.getDataFollowTypePlayer(result, false);
        const bankerCards = this.getDataFollowTypePlayer(result, true);
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

        baccaratMain.cardsUI.playerCards.showCards(playerCards, bankerCards.length === 3 ? null : showResultFunc);
        baccaratMain.cardsUI.bankerCards.showCards(bankerCards, bankerCards.length === 3 ? showResultFunc : null, playerCards.length === 3);
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

    public showWinNotice(result) {
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
