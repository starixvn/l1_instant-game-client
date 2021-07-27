import * as _ from "lodash";

import { getLowercaseObjectKeys } from "../../../common/helper/ObjectHelper";
import GameBase from "../GameBase";
import RoomPlayer from "../view-models/RoomPlayer";
import WebSocketTableGameBase from "../WebSocketTableGameBase";
import DataHandler from "./DataHandler";

export default class GameBaseBetHandler implements DataHandler {
    protected playerChips = [];
    constructor(protected readonly main: GameBase) {}

    handle(data: any): boolean {
        if (this.main.isStopGame || this.main.isDisableGame) {
            return true;
        }

        if (data.totalBets || data.ownBets) {
            this.main.betItems.forEach((item) => item.setData(data));
        }

        this.handleEndBet(data);

        this.handleChipInMainRoom(data);

        return false;
    }

    handleEndBet(data) {
        if (data.endBet) {
            data.endBet !== -1 && this.main.showAcceptedBet(data.endBet); //endCuoc -1 is error
            this.main.showProcessingWarning(false);
        }
    }

    handleChipInMainRoom(data) {
        const mainRoomGame = this.main as WebSocketTableGameBase;
        if (mainRoomGame && mainRoomGame.enablePlaceChips) {
            if (data.ownChip) {
                this.placeOwnChip(data.ownChip);
            }

            if (data.playerChip) {
                this.handlePlayerChipAction(data);
            }

            if (data.chips && data.remainingTime < mainRoomGame.config.betTime) {
                this.placeTotalChips(data.chips);
            }
        }

        return true;
    }

    handlePlayerChipAction(data: any) {
        this.playerChips.push(data.playerChip);
        let delayTime = 0;

        if (this.main.currentTimeRemaining >= this.main.config.stopBetTime + 2) {
            delayTime = this.playerChips.length * 0.07;
        } else {
            delayTime = this.playerChips.length * 0.01;
        }

        this.main.node.runAction(
            cc.sequence(
                cc.delayTime(delayTime > 1 ? delayTime / 2 : delayTime),
                cc.callFunc(() => this.placePlayerChip(data.playerChip))
            )
        );
    }

    placeOwnChip(data: any) {
        const betOption = data.box.toLowerCase();
        const bet = data.bet;
        const betItem = _.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betOption);

        this.main.betChips.placeChipBet(bet, betItem.chipNode);
    }

    placePlayerChip(data: any) {
        const gameRoomMain = this.main as WebSocketTableGameBase;

        if (gameRoomMain) {
            const betOption = data.box.toLowerCase();
            const bet = data.bet;
            let startNode: cc.Node;
            const playerSlot = gameRoomMain.playerHandler.getPlayerSlot(data.playerId);
            const betItem = _.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betOption);

            if (playerSlot) {
                this.updatePlayerSlotDataStorage(data, playerSlot);
                startNode = playerSlot.avatar.node;
            } else {
                startNode = gameRoomMain.otherPlayers;
                this.updateOtherDataStorage(data);
            }
            this.main.betChips.placeChipBet(bet, betItem.chipNode, startNode);
            this.playerChips.pop();
        }
    }

    updatePlayerSlotDataStorage(data, playerSlot) {
        playerSlot.setBalance(data.red);
        playerSlot.data.idleCount = 0;
        RoomPlayer.storePlayerToCache(playerSlot.data, this.main.gameName);
    }

    updateOtherDataStorage(data) {
        const gameRoomMain = this.main as WebSocketTableGameBase;
        const player = gameRoomMain.playerHandler.otherPlayers[data.playerId];

        if (player) {
            player.idleCount = 0;
            player.red = data.red;
            gameRoomMain.playerHandler.otherPlayers[data.playerId] = player;
            RoomPlayer.storePlayerToCache(player, this.main.gameName);
        }
    }

    placeTotalChips(chips) {
        if (!chips) {
            return;
        }

        const chipsKeys = getLowercaseObjectKeys(chips);

        _.forEach(this.main.betItems, (item) => {
            const betItemData = chips[chipsKeys[item.node.name.toLowerCase()]];
            this.main.betChips.initChips(betItemData, item.chipNode);
        });
    }
}
