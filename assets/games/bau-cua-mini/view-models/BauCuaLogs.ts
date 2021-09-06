import _ = require("lodash");
import BauCuaLogItems from "./BauCuaLogItems";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCuaLogs extends cc.Component {
    @property(cc.Node)
    contentLogs: cc.Node = null;

    @property(cc.Prefab)
    logItemPrefab: cc.Prefab = null;

    @property({ type: cc.SpriteFrame })
    iconMini: cc.SpriteFrame[] = [];

    private currentDataLogs: any = null;
    private readonly limitLog = 30;

    public setData(logs: any) {
        this.currentDataLogs = logs;
    }

    addLogs() {
        this.contentLogs.removeAllChildren();
        const logLength = this.currentDataLogs.length;
        const count = Math.min(this.limitLog, logLength);

        const characterCounts = {};
        for (let index = 0; index < count; index++) {
            const { result } = this.currentDataLogs[index];

            const node = cc.instantiate(this.logItemPrefab);
            const nodeComponent = node.getComponent(BauCuaLogItems);
            _.values(result).forEach((character: number, index: number) => {
                characterCounts[character] = (characterCounts[character] ?? 0) + 1;
                nodeComponent.icon[index].spriteFrame = this.iconMini[character];
            });
            this.contentLogs.addChild(node);
        }
    }
}
