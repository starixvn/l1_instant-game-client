import MiniPanel from "../../../common/control/mini-panel/MiniPanel";
import MiniRoundHistory from "../../../common/control/mini-round-history/MiniRoundHistory";
import { GameIds } from "../../../configs/SabaConfigs";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import BalancedBettingPoolGameBase from "./BalancedBettingPoolGameBase";
import { BigSmallConfigs } from "./BigSmallConfigs";
import BigSmallBetHandler from "./handlers/BigSmallBetHandler";
import BigSmallFinishHandler from "./handlers/BigSmallFinishHandler";
import BigSmallLogsHandler from "./handlers/BigSmallLogsHandler";
import BigSmallStatusHandler from "./handlers/BigSmallStatusHandler";
import BigSmallTimeHandler from "./handlers/BigSmallTimeHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmall extends BalancedBettingPoolGameBase {
    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Animation)
    diceAnimation: cc.Animation = null;

    @property(cc.Node)
    diceContainer: cc.Node = null;

    @property({ type: cc.Sprite })
    dices: cc.Sprite[] = [];

    @property({ type: cc.SpriteFrame })
    diceFrames: cc.SpriteFrame[] = [];

    @property(cc.Label)
    betPercentageLeft: cc.Label = null;

    @property(cc.Label)
    betPercentageRight: cc.Label = null;

    @property(cc.Node)
    resultNode: cc.Node = null;

    @property(cc.Label)
    resultLabel: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    protected miniRoundHistory: MiniRoundHistory;
    diceAnimationDuration: number;

    readonly choices = ["small", "big"];

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = GameIds.BigSmall;
        this.setConfig(new BigSmallConfigs());
    }

    onLoad() {
        super.onLoad();
        this.diceAnimationDuration = this.diceAnimation.defaultClip.duration / this.diceAnimation.defaultClip.speed;
        this.setValueBetAmount();
        this.initRoundHistory();
    }

    onDestroy() {
        super.onDestroy();
        this.miniRoundHistoryContainer.isValid && this.miniRoundHistoryContainer.destroyAllChildren();
    }

    onData(data: any) {
        super.onData(data);
    }

    initHandlers() {
        super.initHandlers();

        this.timeHandler = new BigSmallTimeHandler(this);
        this.logsHandler = new BigSmallLogsHandler(this);
        this.finishHandler = new BigSmallFinishHandler(this);
        this.betHandler = new BigSmallBetHandler(this);
        this.statusHandler = new BigSmallStatusHandler(this);
    }

    setValueBetAmount() {
        this.betPercentages = {
            [this.choices[0]]: this.betPercentageRight,
            [this.choices[1]]: this.betPercentageLeft
        };
    }

    initRoundHistory() {
        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(MiniRoundHistory);
        this.miniRoundHistoryContainer.addChild(mini);
    }

    updateRoundHistory() {
        this.miniRoundHistory.setData(this.currentDataLogs);
    }

    setDices(result) {
        Object.keys(result).forEach((key, index) => {
            this.dices[index].spriteFrame = this.diceFrames[result[key] - 1];
        });
    }

    showResult() {
        if (this.currentDataLogs.length > 0) {
            const { settlementResult } = this.currentDataLogs[0];

            cc.tween(this.node)
                .call(() => {
                    this.diceAnimation.node.active = true;
                    this.diceContainer.active = false;
                    this.diceAnimation.play();

                    const currentStatusData = this.statusHandler.currentStatusData;
                    currentStatusData && this.statusHandler.status(currentStatusData.win, currentStatusData.bet);
                })
                .delay(this.diceAnimationDuration)
                .call(() => {
                    this.diceAnimation.node.active = false;
                    this.diceContainer.active = true;
                    this.updateRoundHistory();
                })
                .start();

            (this.finishHandler as GameBaseFinishHandler).payChips(settlementResult, null);
            this.finishShowResult = true;
        }
    }

    showWinningAnimation(data) {
        cc.tween(this.node)
            .delay(this.diceAnimationDuration)
            .call(() => {
                this.betItems.forEach((betItem) => {
                    betItem.setHighlight(data.settlementResult[betItem.node.name], true);
                });

                this.resultNode.active = true;
                this.resultLabel.string = data.result.dice1 + data.result.dice2 + data.result.dice3;
            })
            .start();
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.statusHandler.currentStatusData = null;
        this.diceAnimation.stop();
        this.diceAnimation.node.active = false;
        this.diceContainer.active = false;
        this.resultNode.active = false;
        this.node.stopAllActions();
        this.betItems.forEach((betItem) => {
            betItem.ownBet.string = "0";
        });
    }

    public updateOddsFromConfigs() {
        if (this.gameConfigs.odds) {
            this.odds.string = `1:${this.gameConfigs.odds[this.choices[0]]}`;
        }
    }
}
