import * as _ from "lodash";

import { getLowercaseObjectKeys } from "../../../common/helper/ObjectHelper";
import GameUtils from "../../../common/utils/GameUtils";
import GameBase from "../GameBase";
import BetItem from "../view-models/BetItem";
import RoomPlayer from "../view-models/RoomPlayer";
import WebSocketTableGameBase from "../WebSocketTableGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseFinishHandler implements DataHandler {
    protected readonly payChipFlyTime = 1.2;
    protected get WinningAnimationDuration() {
        return 3;
    }

    constructor(protected readonly main: GameBase, protected readonly playResultAnimationTime: number = 0) {}

    handle(data: any): boolean {
        if (data.finish) {
            this.main.finishShowResult = false;
            this.main.node.activeInHierarchy && this.main.gameAudios.playEndGameAudio();
            this.setNewGameRound(data);
            const mainRoomGame = this.main as WebSocketTableGameBase;
            if (mainRoomGame && mainRoomGame.playerHandler) {
                this.updateOtherPlayerBalance(data.finish.winningPlayers, mainRoomGame);
            }
            this.handleFinishData(data.finish, () => {
                this.payChips(data.finish.settlementResult, data.finish.winningPlayers);
                this.main.finishShowResult = true;
            });
        }

        return true;
    }

    protected setNewGameRound(data: any) {
        this.main.timeHandler.resetTime();
        this.main.roundId = data.finish.roundId + 1;
    }

    public getResultAnimationTime() {
        return this.playResultAnimationTime;
    }

    handleFinishData(dataFinish, onFinishHanlingData: () => void = null) {}

    payChips(settlementResult: any, winningPlayers: any) {
        const mainRoomGame = this.main as WebSocketTableGameBase;

        if (!mainRoomGame || !settlementResult || !mainRoomGame.enablePlaceChips) {
            return;
        }
        const settlementResultKeys = getLowercaseObjectKeys(settlementResult);
        const lostBetItems = _.filter(this.main.betItems, (item) => !settlementResult[settlementResultKeys[item.node.name.toLowerCase()]]);
        const winBetItems = _.filter(this.main.betItems, (item) => !!settlementResult[settlementResultKeys[item.node.name.toLowerCase()]]);

        this.main.node &&
            this.main.node.runAction(
                cc.sequence(
                    cc.delayTime(this.main.betChips.chipDelayFlyingTime),
                    cc.callFunc(() => this.dealerGetChips(mainRoomGame, lostBetItems)),
                    cc.delayTime(this.main.betChips.chipDelayFlyingTime),
                    cc.callFunc(() => this.dealerPayChips(mainRoomGame, winBetItems)),
                    cc.delayTime(this.main.betChips.chipDelayFlyingTime),
                    cc.callFunc(() => {
                        if (mainRoomGame.otherPlayers) {
                            this.payChipsToLoginPlayer(mainRoomGame, this.main.statusHandler.currentStatusData, winBetItems, true);
                            this.payChipsToOtherPlayers(mainRoomGame, winBetItems);
                        } else {
                            this.payChipsToLoginPlayer(mainRoomGame, this.main.statusHandler.currentStatusData, winBetItems, false);
                        }

                        this.payChipsToInGamePlayers(winningPlayers, mainRoomGame, winBetItems);
                    })
                )
            );
    }

    dealerGetChips(mainRoomGame: WebSocketTableGameBase, lostBetItems: BetItem[]) {
        _.forEach(lostBetItems, (item) => {
            this.main.betChips.moveChips(item.chipNode, mainRoomGame.dealerChipBox);
        });
    }

    dealerPayChips(mainRoomGame: WebSocketTableGameBase, winBetItems: BetItem[]) {
        _.forEach(winBetItems, (item) => {
            this.main.betChips.payChipsToWinningBetItem(item.chipNode, mainRoomGame.dealerChipBox);
        });
    }

    payChipsToLoginPlayer(mainRoomGame: WebSocketTableGameBase, statusData, winBetItems: BetItem[], isOtherPlayers = true) {
        if (!statusData || !statusData.win) {
            return;
        }

        const betItems = statusData.winningByChoices;
        if (isOtherPlayers) {
            this.moveChipWithRandomAmountToLoginPlayer(winBetItems, betItems, mainRoomGame);
        } else {
            this.moveChipWithAmountToLoginPlayer(winBetItems, betItems, mainRoomGame);
        }

        const playerNode = mainRoomGame.userAvatar.node.parent;
        this.main.showWinningBet(statusData.bet);
        this.playWinningEffect(mainRoomGame, playerNode);
        this.main.updateUserBalance();
    }

    moveChipWithRandomAmountToLoginPlayer(winBetItems: BetItem[], betItems, mainRoomGame: WebSocketTableGameBase) {
        _.forEach(winBetItems, (item) => {
            if (betItems[item.node.name.toLowerCase()]) {
                this.main.betChips.moveChipsWithRandomAmount(item.chipNode, mainRoomGame.userAvatar.node, this.payChipFlyTime);
            }
        });
    }

    moveChipWithAmountToLoginPlayer(winBetItems: BetItem[], betItems, mainRoomGame: WebSocketTableGameBase) {
        const betItemLowercaseObjectKeys = getLowercaseObjectKeys(betItems);

        _.forEach(winBetItems, (item) => {
            if (betItems[betItemLowercaseObjectKeys[item.node.name.toLowerCase()]]) {
                this.main.betChips.moveChips(item.chipNode, mainRoomGame.userAvatar.node);
            }
        });
    }

    updateOtherPlayerBalance(winningPlayers: any, main: WebSocketTableGameBase) {
        if (!winningPlayers) {
            return;
        }
        Object.keys(winningPlayers).forEach((playerId) => {
            const otherPlayerData = main.playerHandler.otherPlayers[playerId];
            if (otherPlayerData) {
                const winningPlayerData = winningPlayers[playerId];
                otherPlayerData.red += winningPlayerData.bet;
                RoomPlayer.storePlayerToCache(otherPlayerData, main.gameName);
            }
        });
    }

    payChipsToInGamePlayers(winningPlayers: any, mainRoomGame: WebSocketTableGameBase, winBetItems: BetItem[]) {
        if (!winningPlayers) {
            return;
        }

        const winningPlayerIds = Object.keys(winningPlayers);

        _.forEach(winningPlayerIds, (playerId) => {
            const winningPlayerData = winningPlayers[playerId];
            const playerSlot = mainRoomGame.playerHandler.getPlayerSlot(playerId);
            const playerBetItems = winningPlayerData.winningByChoices;
            const bet = winningPlayerData.bet;

            if (playerSlot) {
                _.forEach(winBetItems, (item) => {
                    if (playerBetItems && playerBetItems[item.node.name.toLowerCase()] > 0) {
                        this.main.betChips.moveChipsWithRandomAmount(item.chipNode, playerSlot.avatar.node, this.payChipFlyTime);
                    }
                });

                playerSlot.increaseBalance(winningPlayerData.bet);
                GameUtils.addFlyingText(playerSlot.node, true, bet, this.WinningAnimationDuration, 0, 10);
                this.playWinningEffect(mainRoomGame, playerSlot.node);
            }
        });
    }

    payChipsToOtherPlayers(roomGame: WebSocketTableGameBase, winBetItems: BetItem[]) {
        let hasChip = false;

        _.forEach(winBetItems, (item) => {
            if (!hasChip) {
                hasChip = item.chipNode.children.length > 0;
            }
            this.main.betChips.moveChips(item.chipNode, roomGame.otherPlayers);
        });

        hasChip && this.main.betChips.playMultiChipsSound();
    }

    playWinningEffect(mainRoomGame: WebSocketTableGameBase, playerNode: cc.Node, duration = this.WinningAnimationDuration) {
        const winningEffect = cc.instantiate(mainRoomGame.winningPlayerEffectPrefab);
        winningEffect.name = "winningEffect";
        playerNode.addChild(winningEffect);
        const animation = winningEffect.getComponent(cc.Animation);

        winningEffect.runAction(
            cc.sequence(
                cc.callFunc(() => {
                    animation.play();
                }),
                cc.delayTime(duration), // 2 * animation.defaultClip.duration, should be multiple of duration to fix animation disappear suddenly
                cc.callFunc(() => {
                    winningEffect.destroy();
                })
            )
        );
    }
}
