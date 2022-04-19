import MiniPanel from "../../../common/control/mini-panel/MiniPanel";
import MiniRoundHistory from "../../../common/control/mini-round-history/MiniRoundHistory";
import GameUtils from "../../../common/utils/GameUtils";
import { GameIds } from "../../../configs/SabaConfigs";
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
    shakeThePlateAnimation: cc.Animation = null;

    @property(cc.Node)
    diceContainer: cc.Node = null;

    @property(cc.SpriteAtlas)
    diceAtlas: cc.SpriteAtlas = null;

    @property(cc.Label)
    betPercentageLeft: cc.Label = null;

    @property(cc.Label)
    betPercentageRight: cc.Label = null;

    @property(cc.Node)
    resultNode: cc.Node = null;

    @property(cc.Label)
    resultLabel: cc.Label = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    @property(cc.Node)
    tipContainer: cc.Node = null;

    @property(cc.Node)
    thePlate: cc.Node = null;

    private dices: cc.Sprite[] = [];
    private miniRoundHistory: MiniRoundHistory;

    readonly choices = ["small", "big"];

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = GameIds.BigSmall;
        this.setConfig(new BigSmallConfigs());
    }

    onLoad() {
        super.onLoad();
        this.animatedTime.setAnimatedY(40, 0);
        this.diceContainer.children.forEach((child) => this.dices.push(child.getComponent(cc.Sprite)));
        this.setValueBetAmount();
        this.initRoundHistory();

        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });
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
        GameUtils.moveToOtherNode(this.miniRoundHistory.tip.node, this.tipContainer);
    }

    updateRoundHistory() {
        this.miniRoundHistory.setData(this.currentDataLogs);
        if (this.roundHistory && this.roundHistory.isAlive()) {
            const settlementResult = this.currentDataLogs.map((log) => {
                return log.settlementResult.small ? 0 : 1;
            });
            this.roundHistory.setData(settlementResult);
        }
    }

    setDices(result) {
        Object.keys(result).forEach((key, index) => {
            this.dices[index].spriteFrame = this.diceAtlas.getSpriteFrame(`p-${result[key]}`);
        });

        this.resultLabel.string = result.dice1 + result.dice2 + result.dice3;
    }

    showResult(animated: boolean) {
        if (this.currentDataLogs.length === 0) {
            return;
        }

        if (!animated) {
            this.showResultAfterAnimation();
            return;
        }

        cc.tween(this.thePlate)
            .call(() => {
                this.hideBalanceBetNotice();
            })
            .to(0.3, { position: cc.v2(50, 150) }, { easing: "sineInOut" })
            .call(() => {
                const currentStatusData = this.statusHandler.currentStatusData;
                currentStatusData && this.statusHandler.status(currentStatusData.win, currentStatusData.bet);
                this.showResultAfterAnimation();
                this.updateRoundHistory();
            })
            .start();
    }

    showResultAfterAnimation() {
        this.showWinningAnimation(this.currentDataLogs[0]);
        this.resultNode.active = true;
    }

    showWinningAnimation(data) {
        const { settlementResult } = data;
        this.betItems.forEach((betItem) => {
            betItem.setHighlight(settlementResult[betItem.node.name], true);
        });
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.resetThePlate();
        this.statusHandler.currentStatusData = null;
        this.betItems.forEach((betItem) => {
            betItem.ownBet.string = "0";
        });
        this.resultNode.active = false;
    }

    resetThePlate() {
        this.thePlate.position = cc.v2(0, 7);
        this.thePlate.opacity = 255;
        this.thePlate.active = true;
    }
}
