import MiniPanel from "../../common/control/mini-panel/MiniPanel";
import MiniRoundHistory from "../../common/control/mini-round-history/MiniRoundHistory";
import GameUtils from "../../common/utils/GameUtils";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { GameIds, GameInfos } from "../../configs/SabaConfigs";
import SocketIOMiniGameBase from "../_base/SocketIOMiniGameBase";
import SedieMiniRoundHistory from "../sedie/view-models/SedieMiniRoundHistory";
import SedieRoundHistory from "../sedie/view-models/SedieRoundHistory";
import MiniSedieFinishHandler from "./handlers/MiniSedieFinishHandler";
import MiniSedieLogsHandler from "./handlers/MiniSedieLogsHandler";
import MiniSedieTimeHandler from "./handlers/MiniSedieTimeHandler";
import { MiniSedieConfigs } from "./MiniSedieConfigs";
import MiniSedieGuide from "./MiniSedieGuide";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniSedie extends SocketIOMiniGameBase {
    @property({ type: cc.Sprite })
    dots: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    dotRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    dotWhite: cc.SpriteFrame = null;

    @property(cc.Animation)
    animation: cc.Animation = null;

    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Node)
    dishNode: cc.Node = null;

    @property(cc.Prefab)
    roundHistoryPrefab: cc.Prefab = null;

    public miniRoundHistory: SedieMiniRoundHistory = null;
    public roundHistory: SedieRoundHistory = null;
    public resultAnimating = false;
    public originalDishPosition = cc.v2(0, 6);

    onLoad() {
        super.onLoad();

        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(MiniRoundHistory);
        this.miniRoundHistoryContainer.addChild(mini);
        this.animatedTime.setAnimatedY(15, -5);
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = GameIds.MiniSedie;
        this.setConfig(new MiniSedieConfigs());
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.animation.node.active = false;
    }

    onDestroy() {
        super.onDestroy();
        this.miniRoundHistoryContainer.isValid && this.miniRoundHistoryContainer.destroyAllChildren();
    }

    onEnable() {
        super.onEnable();
    }

    initHandlers() {
        super.initHandlers();
        this.finishHandler = new MiniSedieFinishHandler(this);
        this.timeHandler = new MiniSedieTimeHandler(this);
        this.logsHandler = new MiniSedieLogsHandler(this);
    }

    public showResult() {
        if (this.currentDataLogs.length) {
            const dataLog = this.currentDataLogs[0];
            this.setDots(dataLog.result);
            this.highlightWonItems(dataLog.settlementResult, true);
            this.dishNode.position = cc.v3(0, 150);
            this.dishNode.active = false;
        }
    }

    public highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];
        dataLog && this.highlightWonItems(dataLog.settlementResult, false);
    }

    public setDots(result) {
        Object.keys(result).forEach((key, index) => {
            this.dots[index].spriteFrame = result[key] ? this.dotRed : this.dotWhite;
        });
    }

    private highlightWonItems(settlementResult: any, isAnimated = true) {
        this.betItems.forEach((betItem) => {
            betItem.setHighlight(settlementResult[betItem.node.name], isAnimated);
        });
    }

    public updateRoundHistory() {
        const miniHistoryData = this.currentDataLogs.map((d) => {
            let count = 0;
            const list = ["red1", "red2", "red3", "red4"];
            list.forEach((i) => {
                if (d.result[i]) {
                    count++;
                }
            });
            return {
                roundId: d.roundId || d.id,
                red: count
            };
        });
        this.miniRoundHistory.setData(miniHistoryData);
        if (this.roundHistory && this.roundHistory.isAlive()) {
            this.roundHistory.setData(miniHistoryData.map((d) => d.red));
        }
    }

    showAcceptedBet(bet: number) {
        GameUtils.addFlyingText(this.betChipsContainer, false, bet, 1);
    }

    openGuide() {
        const lang = NoticeUtil.getCurrentLanguage();
        const gameName = GameInfos[this.gameId].key;
        GameUtils.loadResource(`guides/${gameName}_${lang}`).then((prefab) => {
            const node = cc.instantiate(prefab);
            const guide = node.getComponent(MiniSedieGuide);
            guide.init(this.gameConfigs);
            this.currentMiniPanel.addDialog(node);
        });
    }

    openScoreBoard() {
        cc.GameManager.playClick();

        const node = cc.instantiate(this.roundHistoryPrefab);
        this.roundHistory = node.getComponent(SedieRoundHistory);
        this.roundHistory.init(this);
        this.currentMiniPanel.addDialog(node);
        this.updateRoundHistory();
    }
}
