import _ = require("lodash");
import GameBase from "../../_base/GameBase";
import GameRoundHistory from "../../_base/view-models/GameRoundHistory";
import BauCuaLogItems from "./BauCuaLogItems";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCuaRoundHistory extends GameRoundHistory {
    @property(cc.Node)
    contentLogs: cc.Node = null;

    @property(cc.Prefab)
    logItemPrefab: cc.Prefab = null;

    @property({ type: cc.SpriteFrame })
    iconMini: cc.SpriteFrame[] = [];

    private readonly limitLog = 30;
    protected suffix = "";

    updateStatistic(roundHistoryData) {
        const total = roundHistoryData.length;

        if (total === 0) {
            this.updateStatisticLabels([0, 0, 0]);
            return;
        }

        this.contentLogs.removeAllChildren();
        const count = Math.min(this.limitLog, total);
        const characterCounts = {};

        for (let index = 0; index < count; index++) {
            const { result } = roundHistoryData[index];

            const node = cc.instantiate(this.logItemPrefab);
            const nodeComponent = node.getComponent(BauCuaLogItems);
            _.values(result).forEach((character: number, i: number) => {
                characterCounts[character] = (characterCounts[character] ?? 0) + 1;
                nodeComponent.icon[i].spriteFrame = this.iconMini[character];
            });

            this.contentLogs.addChild(node);
        }
        this.updateStatisticLabels(characterCounts);
    }
}
