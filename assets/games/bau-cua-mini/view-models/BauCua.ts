import * as _ from "lodash";

import { GameIds } from "../../../configs/SabaConfigs";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import vipFishPrawnCrabConstants from "../../vip-fish-prawn-crab/view-models/VipFishPrawnCrabConstants";
import BauCuaBetItem from "./BauCuaBetItem";
import { BauCuaConfigs } from "./BauCuaConfigs";
import BauCuaHistory from "./BauCuaHistory/BauCuaHistory";
import BauCuaLogItems from "./BauCuaLogItems";
import BauCuaOddItem from "./BauCuaOddItem";
import BauCuaFinishHandler from "./handlers/BauCuaFinishHandler";
import BauCuaLogsHandler from "./handlers/BauCuaLogsHandler";
import BauCuaTimeHandler from "./handlers/BauCuaTimeHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCua extends SocketIOMiniGameBase {
    @property({ type: cc.SpriteFrame })
    iconMini: cc.SpriteFrame[] = [];

    @property({ type: cc.SpriteFrame })
    iconLV: cc.SpriteFrame[] = [];

    @property({ type: cc.Sprite })
    dices: cc.Sprite[] = [];

    @property({ type: cc.Label })
    characterCountLabels: cc.Label[] = [];

    @property(cc.Label)
    userCountLabel: cc.Label = null;

    @property(cc.Label)
    waitedTime: cc.Label = null;

    @property(cc.Animation)
    animationNode: cc.Animation = null;

    @property(cc.Node)
    logNode: cc.Node = null;

    @property(cc.Node)
    contentLogs: cc.Node = null;

    @property(cc.Prefab)
    prefabLogs: cc.Prefab = null;

    @property(cc.Node)
    center: cc.Node = null;

    @property(cc.Prefab)
    historyDialog: cc.Prefab = null;

    @property(cc.Label)
    oddOne: cc.Label = null;

    @property(cc.Label)
    oddTwo: cc.Label = null;

    @property(cc.Label)
    oddThree: cc.Label = null;

    @property({ type: BauCuaOddItem })
    oddItems: BauCuaOddItem[] = [];

    @property({ type: cc.Node, override: true })
    betChipsContainer: cc.Node = null;

    @property({ type: cc.Prefab, override: true })
    betChipsPrefab: cc.Prefab = null;

    private readonly limitLog = 30;
    private historyComponent: BauCuaHistory;

    onLoad() {
        super.onLoad();
        this.logNode.active = false;
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = GameIds.FishPrawnCrab;
        this.setConfig(new BauCuaConfigs());
    }

    onData(data: any) {
        super.onData(data);
        if (data.history) {
            this.historyComponent.onData(data.history);
        }
    }

    onEnable() {
        super.onEnable();
        if (this.currentDataLogs && this.currentDataLogs.length > 0) {
            this.logNode.active = true;
        }
    }

    initHandlers() {
        super.initHandlers();
        this.finishHandler = new BauCuaFinishHandler(this);
        this.logsHandler = new BauCuaLogsHandler(this);
        this.timeHandler = new BauCuaTimeHandler(this);
    }

    addLogs() {
        this.contentLogs.removeAllChildren();
        const logLength = this.currentDataLogs.length;
        const count = Math.min(this.limitLog, logLength);
        if (count === 0) {
            this.logNode.active = false;
            return;
        }

        this.logNode.active = true;
        const characterCounts = {};
        for (let index = 0; index < count; index++) {
            const { result } = this.currentDataLogs[index];

            const node = cc.instantiate(this.prefabLogs);
            const nodeComponent = node.getComponent(BauCuaLogItems);
            _.values(result).forEach((character: number, index: number) => {
                characterCounts[character] = (characterCounts[character] ?? 0) + 1;
                nodeComponent.icon[index].spriteFrame = this.iconMini[character];
            });
            this.contentLogs.addChild(node);
        }

        this.characterCountLabels.forEach((label, index) => {
            label.string = characterCounts[index] ?? "0";
        });
    }

    pressedShowScoreBoard() {
        cc.RedT.audio.playClick();
        this.logNode.active = !this.logNode.active;
    }
    pressedHistoryDialog() {
        cc.RedT.audio.playClick();
        const dialog = cc.instantiate(this.historyDialog);
        this.historyComponent = dialog.getComponent(BauCuaHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    updateOddsFromConfigs() {
        this.gameConfigs.odds && this.oddItems.forEach((item) => item.setValue(this.gameConfigs.odds[item.node.name]));
    }

    setDiceResult() {
        if (this.currentDataLogs.length > 0) {
            const { result } = this.currentDataLogs[0];
            const dices = _.values(result);
            dices.forEach((dice, index) => {
                this.dices[index].spriteFrame = this.iconLV[dice];
                this.dices[index].node.active = true;
            });
        }
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.animationNode.node.active = false;
        this.hideAllDices();
        this.node.stopAllActions();
        this.resetXTimesResult();
    }

    hideAllDices() {
        this.dices.forEach((dice) => {
            dice.node.active = false;
        });
    }

    resetXTimesResult() {
        this.betItems.forEach((betItem: BauCuaBetItem) => {
            betItem.hideXTimesResult();
        });
    }

    resetUIBetItems() {
        this.betItems.forEach((betItem: BauCuaBetItem) => {
            betItem.resetHighlight();
        });
    }

    highlightWinningBetItems(type: boolean) {
        if (this.currentDataLogs.length > 0) {
            const { result, settlementResult } = this.currentDataLogs[0];
            this.betItems.forEach((betItem: BauCuaBetItem) => {
                const choice = betItem.node.name;
                betItem.updateHighlight(false);
                betItem.setHighlight(settlementResult[choice], type);

                if (_.keys(vipFishPrawnCrabConstants.resultMapper).indexOf(choice) >= 0) {
                    const xValue = _.values(result).filter((value) => value === vipFishPrawnCrabConstants.resultMapper[choice]).length;
                    if (xValue > 1) {
                        betItem.setXSpriteFrame(xValue === 2 ? betItem.x2Sprite : betItem.x3Sprite);
                    }
                }
            });
        }
    }
}
