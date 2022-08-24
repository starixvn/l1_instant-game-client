import MiniPanel from "../../../common/control/mini-panel/MiniPanel";
import MiniRoundHistory from "../../../common/control/mini-round-history/MiniRoundHistory";
import GameUtils from "../../../common/utils/GameUtils";
import { GameIds } from "../../../configs/SabaConfigs";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import BaccaratBetOptions from "../components/view-models/BaccaratBetOptions";
import BaccaratCardsUI from "../components/view-models/BaccaratCardsUI";
import BaccaratConfigs from "./BaccaratConfigs";
import BaccaratFinishHandler from "./data-handlers/BaccaratFinishHandler";
import BaccaratLogsHandler from "./data-handlers/BaccaratLogsHandler";
import BaccaratTimeDataHandler from "./data-handlers/BaccaratTimeDataHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Baccarat extends SocketIOMiniGameBase {
    @property(cc.Animation)
    animation: cc.Animation = null;

    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    @property(cc.Node)
    tipContainer: cc.Node = null;

    public resultAnimating = false;
    public originalDishPosition = cc.v2(0, 6);
    public betOptionsUI: BaccaratBetOptions = null;
    public cardsUI: BaccaratCardsUI = null;
    public miniRoundHistory: MiniRoundHistory;
    protected readonly betTypes = ["player", "banker", "tie"];

    onLoad() {
        super.onLoad();
        this.relocationChipNode();
        this.initMiniRoundHistory();
        this.animatedTime.setAnimatedY(15, -5);
    }

    relocationChipNode() {
        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = GameIds.Baccarat;
        this.setConfig(new BaccaratConfigs());
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.cardsUI?.winningText && (this.cardsUI.winningText.node.parent.active = false);
    }

    onDestroy() {
        super.onDestroy();
        this.miniRoundHistoryContainer.isValid && this.miniRoundHistoryContainer.destroyAllChildren();
    }

    initHandlers() {
        super.initHandlers();
        this.timeHandler = new BaccaratTimeDataHandler(this);
        this.finishHandler = new BaccaratFinishHandler(this);
        this.logsHandler = new BaccaratLogsHandler(this);
    }

    private initBetOptions(node: cc.Node) {
        this.betOptionsUI = node.getComponent(BaccaratBetOptions);
        this.betOptionsUI.initBetOptions(this);

        this.betItems?.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });
    }

    private initCardsUI(node: cc.Node) {
        // cardBox
        this.cardsUI = node.getComponent(BaccaratCardsUI);
    }

    initMiniRoundHistory() {
        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(MiniRoundHistory);
        this.miniRoundHistoryContainer.addChild(mini);
        GameUtils.moveToOtherNode(this.miniRoundHistory.tip.node, this.tipContainer);
    }

    updateRoundHistory() {
        this.miniRoundHistory.setData(this.currentDataLogs);
        if (this.roundHistory && this.roundHistory.isAlive()) {
            const settlementResult = this.currentDataLogs.map((log) => {
                return this.getWinItem(log.settlementResult);
            });
            this.roundHistory.setData(settlementResult);
        }
    }

    public getWinItem(settlementResult: any): number {
        for (let i = 0; i < this.betTypes.length; i++) {
            if (settlementResult[this.betTypes[i]]) {
                return i;
            }
        }
        return -1;
    }
}
