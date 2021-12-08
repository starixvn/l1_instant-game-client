import MiniRoundHistory from "../../../common/control/mini-round-history/MiniRoundHistory";
import GameUtils from "../../../common/utils/GameUtils";
import { GameIds } from "../../../configs/SabaConfigs";
import FreeBetGameBase from "../../_base/FreeBetGameBase";
import SedieBetHandler from "./handlers/SedieBetHandler";
import SedieFinishHandler from "./handlers/SedieFinishHandler";
import SedieLogsHandler from "./handlers/SedieLogsHandler";
import SedieStatusHandler from "./handlers/SedieStatusHandler";
import SedieTimeHandler from "./handlers/SedieTimeHandler";
import { SedieConfigs } from "./SedieConfigs";
import SedieHistory from "./SedieHistory";
import SedieMiniRoundHistory from "./SedieMiniRoundHistory";
import SedieRoundHistory from "./SedieRoundHistory";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Sedie extends FreeBetGameBase {
    @property(cc.Prefab)
    historyPrefab: cc.Prefab = null;

    @property(cc.Node)
    roundHistoryContainer: cc.Node = null;

    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Animation)
    shakeThePlateAnimation: cc.Animation = null;

    @property(cc.AudioSource)
    shakeThePlateAudio: cc.AudioSource = null;

    @property(cc.Node)
    thePlate: cc.Node = null;

    @property({ type: cc.Sprite })
    dots: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    dotRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    dotWhite: cc.SpriteFrame = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    protected roundHistory: SedieRoundHistory;
    protected miniRoundHistory: MiniRoundHistory;
    private historyComponent: SedieHistory;

    constructor() {
        super();
        this.internalInit();
    }

    protected internalInit() {
        this.gameId = GameIds.SeDie;
        this.setConfig(new SedieConfigs());
        this.setMiniPanelScale(1);
        this.finishShowResult = false;
    }

    onLoad() {
        super.onLoad();
        this.initRoundHistory();
        this.animatedTime.setAnimatedY(30, -5);

        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });

        this.miniRoundHistory.tip.node.zIndex = 100;
        GameUtils.moveToOtherNode(this.miniRoundHistory.tip.node, this.ownBetContainer);
    }

    initHandlers() {
        super.initHandlers();

        this.logsHandler = new SedieLogsHandler(this);
        this.timeHandler = new SedieTimeHandler(this);
        this.finishHandler = new SedieFinishHandler(this);
        this.betHandler = new SedieBetHandler(this);
        this.statusHandler = new SedieStatusHandler(this);
    }

    initRoundHistory() {
        const node = cc.instantiate(this.roundHistoryPrefab);
        this.roundHistory = node.getComponent(SedieRoundHistory);
        const condition = () => {
            return this.currentTimeRemaining < this.config.stopBetTime || this.currentTimeRemaining > this.config.fullTime;
        };
        this.roundHistory.logControl.init(condition);
        this.roundHistoryContainer.addChild(node);

        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(SedieMiniRoundHistory);
        this.miniRoundHistory.init(condition);
        this.miniRoundHistoryContainer.addChild(mini);
    }

    updateRoundHistory() {
        const miniHistoryData = this.currentDataLogs.map((d) => {
            let count = 0;
            const list = ["red1", "red2", "red3", "red4"];
            list.forEach((i) => {
                if (d.result[i]) {
                    count++;
                }
            });
            return {
                roundId: d.roundId || d.id || d.round,
                red: count
            };
        });
        this.roundHistory.setData(miniHistoryData.map((d) => d.red));
        this.miniRoundHistory.setData(miniHistoryData);
    }

    openHistory() {
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(SedieHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    onDataGameRoom(data) {
        if (data.history) {
            this.historyComponent.onData(data.history);
        }

        super.onDataGameRoom(data);
    }

    setDots(result) {
        Object.keys(result).forEach((key, index) => {
            this.dots[index].spriteFrame = result[key] ? this.dotRed : this.dotWhite;
        });
    }

    showResult() {
        if (this.currentDataLogs.length > 0) {
            const { result, settlementResult } = this.currentDataLogs[0];
            this.setDots(result);
            this.betItems.forEach((betItem) => betItem.setHighlight(settlementResult[betItem.node.name.toLowerCase()], true));
            this.updateRoundHistory();
        }
    }

    openPlate(animated: boolean) {
        if (animated) {
            cc.tween(this.thePlate)
                .to(0.5, { position: cc.v2(50, 100) }, { easing: "sineInOut" })
                .to(0.2, { opacity: 0 })
                .start();
        } else {
            this.thePlate.position = cc.v3(50, 150);
            this.thePlate.opacity = 0;
        }
    }

    closePlate() {
        cc.tween(this.thePlate)
            .to(0, { opacity: 255 })
            .to(0.5, { position: cc.v2(0, 0) })
            .start();
    }

    highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];
        dataLog && this.highlightWonItems(dataLog.settlementResult, false);
    }

    highlightWonItems(settlementResult: any, isAnimated = true) {
        this.betItems.forEach((betItem) => {
            betItem.setHighlight(settlementResult[betItem.node.name], isAnimated);
        });
    }
}
