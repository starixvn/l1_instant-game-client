import * as _ from "lodash";

import GameUtils from "../../../common/utils/GameUtils";
import WebSocketTableGameBase from "../WebSocketTableGameBase";
import GameBaseBetHandler from "./GameBaseBetHandler";

export default class GameRoomBaseBetHandler extends GameBaseBetHandler {
    constructor(protected readonly main: WebSocketTableGameBase) {
        super(main);
    }

    placeOwnChip(data) {
        const { betChoice, amount } = data;
        const betItem = _.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betChoice.toLowerCase());

        this.main.betChips.placeChipBet(amount, betItem.chipNode);
    }

    placePlayerChip(data) {
        const { betChoice, amount, rate } = data;
        let startNode: cc.Node;
        const playerSlot = this.main.playerHandler.getPlayerSlot(data.playerId);
        const betItem = _.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betChoice.toLowerCase());
        if (playerSlot) {
            this.updatePlayerSlotDataStorage(data, playerSlot);
            startNode = playerSlot.avatar.node;
        } else {
            startNode = this.main.otherPlayers;
            this.updateOtherDataStorage(data);
        }

        const convertValue = GameUtils.getValueByCurrency(amount, rate);
        const chipValues = GameUtils.getChipQuantity(convertValue, this.main.betChips.chipValues);

        Object.keys(chipValues).forEach((chipValue) => {
            let count = chipValues[chipValue];
            for (; count > 0; count--) {
                this.main.betChips.placeChipToChipBox(+chipValue, betItem.chipNode, startNode, null);
            }
        });

        this.playerChips.pop();
    }
}
