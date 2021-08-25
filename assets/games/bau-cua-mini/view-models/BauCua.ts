import * as _ from "lodash";

import { GameIds } from "../../../configs/SabaConfigs";
import MiniPanel from "../../../common/control/mini-panel/MiniPanel";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import vipFishPrawnCrabConstants from "./BauCuaConstants";
import BauCuaBetItem from "./BauCuaBetItem";
import { BauCuaConfigs } from "./BauCuaConfigs";
import BauCuaOddItem from "./BauCuaOddItem";
import BauCuaFinishHandler from "./handlers/BauCuaFinishHandler";
import BauCuaLogsHandler from "./handlers/BauCuaLogsHandler";
import BauCuaTimeHandler from "./handlers/BauCuaTimeHandler";
import GameUtils from "../../../common/utils/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BauCua extends SocketIOMiniGameBase {
    @property({ type: cc.SpriteFrame })
    iconLV: cc.SpriteFrame[] = [];

    @property({ type: cc.Sprite })
    dices: cc.Sprite[] = [];

    @property(cc.Node)
    dishNode: cc.Node = null;

    @property(cc.Animation)
    animationNode: cc.Animation = null;

    @property({ type: BauCuaOddItem })
    oddItems: BauCuaOddItem[] = [];

    @property({ type: cc.Node, override: true })
    betChipsContainer: cc.Node = null;

    @property({ type: cc.Prefab, override: true })
    betChipsPrefab: cc.Prefab = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    onLoad() {
        super.onLoad();
        this.relocationChipNode();
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = GameIds.FishPrawnCrab;
        this.setConfig(new BauCuaConfigs());
    }

    initHandlers() {
        super.initHandlers();
        this.finishHandler = new BauCuaFinishHandler(this);
        this.logsHandler = new BauCuaLogsHandler(this);
        this.timeHandler = new BauCuaTimeHandler(this);
    }

    relocationChipNode() {
        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });
    }

    pressedShowScoreBoard() {
        cc.GameManager.audio.playClick();
    }

    updateOddsFromConfigs() {
        this.gameConfigs.odds && this.oddItems.forEach((item) => item.setValue(this.gameConfigs.odds[item.node.name]));
    }

    public updateRoundHistory() {
        if (this.roundHistory && this.roundHistory.isAlive()) {
            this.roundHistory.setData(this.currentDataLogs);
        }
    }

    setDiceResult() {
        if (this.currentDataLogs.length > 0) {
            const { result } = this.currentDataLogs[0];
            const dices = _.values(result);
            dices.forEach((dice, index) => {
                this.dices[index].spriteFrame = this.iconLV[dice];
                this.dices[index].node.active = true;
            });

            this.updateRoundHistory();
        }
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.dishNode.active = true;
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
