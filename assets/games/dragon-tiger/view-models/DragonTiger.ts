import MiniRoundHistory from "../../../common/control/mini-round-history/MiniRoundHistory";
import NewCard from "../../../common/control/new-card/view-models/NewCard";
import { GameIds, GameInfos } from "../../../configs/SabaConfigs";
import MiniPanel from "../../../common/control/mini-panel/MiniPanel";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import RHFinishDataHandler from "./handlers/RHFinishDataHandler";
import RHGameTimeHandler from "./handlers/RHGameTimeHandler";
import RHLogsDataHandler from "./handlers/RHLogsDataHandler";
import { DragonTigerConfigs } from "./DragonTigerConfigs";
import NoticeUtil from "../../../common/utils/NoticeUtil";
import GameUtils from "../../../common/utils/GameUtils";
import DragonTigerGuide from "./DragonTigerGuide";
import DragonTigerRoundHistory from "./DragonTigerRoundHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonTiger extends SocketIOMiniGameBase {
    @property(cc.Animation)
    resultAnimation: cc.Animation = null;

    @property(cc.Animation)
    drawAnimation: cc.Animation = null;

    @property(cc.Node)
    resultFrame: cc.Node = null;

    @property({ type: cc.Node })
    frontCardNodes: cc.Node[] = [];

    @property({ type: cc.Sprite })
    cardBacks: cc.Sprite[] = [];

    @property(cc.AudioSource)
    audioDrawCard: cc.AudioSource = null;

    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Prefab)
    roundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    @property(cc.Node)
    tipContainer: cc.Node = null;

    public resultCards = [];
    public miniRoundHistory: MiniRoundHistory = null;
    private roundHistory: DragonTigerRoundHistory;
    public resultAnimating = false;
    private frontCards: NewCard[] = [];
    protected readonly betTypes = ["dragon", "tiger", "tie"];

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = GameIds.DragonTiger;
        this.setConfig(new DragonTigerConfigs());
    }

    protected onChangedBetChip(bet) {
        super.onChangedBetChip(bet);
    }

    onLoad() {
        super.onLoad();
        this.relocationChipNode();
        const mini = cc.instantiate(this.miniRoundHistoryPrefab);
        this.miniRoundHistory = mini.getComponent(MiniRoundHistory);
        this.miniRoundHistoryContainer.addChild(mini);
        this.frontCards = this.frontCardNodes.map((card) => card.children[0].getComponent(NewCard));
        GameUtils.moveToOtherNode(this.miniRoundHistory.tip.node, this.tipContainer);
    }

    relocationChipNode() {
        this.betItems.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });
    }

    onEnable() {
        this.cardBacks.forEach((back) => (back.node.scale = 1));

        this.resultAnimation.on("finished", () => {
            this.showResult(true);
        });
    }

    onDisable() {
        super.onDisable();
        this.resultAnimation.stop();
        this.drawAnimation.stop();
        this.resultAnimation.off("finished");
    }

    protected initHandlers() {
        super.initHandlers();

        this.logsHandler = new RHLogsDataHandler(this);
        this.finishHandler = new RHFinishDataHandler(this);
        this.timeHandler = new RHGameTimeHandler(this);
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.resultFrame.active = false;
        this.cardBacks.forEach((back) => (back.node.scale = 1));
        this.drawAnimation.stop();
        this.resultAnimation.stop();
        this.node.stopAllActions();
    }

    private showResultCards(show: boolean) {
        if (this.resultCards.length !== 2 && show) {
            return;
        }

        if (show) {
            this.resultCards.forEach((data, index) => {
                const card = this.frontCardNodes[index];
                card.active = true;
                card.scaleX = 1;
                this.frontCards[index].setCardOldStyle({
                    rank: data.card.toString(),
                    suit: data.type
                });
                this.frontCards[index].faceUp();
            });
        } else {
            this.frontCardNodes.forEach((card, index) => {
                card.scaleX = 0;
                this.frontCards[index].faceDown();
            });
        }
    }

    private updateResultCards() {
        if (this.resultCards.length !== 2) {
            return;
        }

        this.resultCards.forEach((data, index) => {
            this.frontCards[index].setCardOldStyle({
                rank: data.card.toString(),
                suit: data.type
            });
            this.frontCards[index].faceUp();
        });
    }

    public getWinItem(settlementResult: any): number {
        for (let i = 0; i < this.betTypes.length; i++) {
            if (settlementResult[this.betTypes[i]]) {
                return i;
            }
        }
        return -1;
    }

    private highlightWonItem(highlight: boolean, winItem = "") {
        if (highlight) {
            if (winItem !== "") {
                this.betItems.forEach((item) => {
                    item.setHighlight(item.node.name === winItem);
                });
            }
        } else {
            this.betItems.forEach((item) => item.resetHighlight());
        }
    }

    public updateRoundHistory() {
        this.miniRoundHistory.setData(this.currentDataLogs);

        if (this.roundHistory && this.roundHistory.isAlive()) {
            const settlementResult = this.currentDataLogs.map((log) => {
                return this.getWinItem(log.settlementResult);
            });
            this.roundHistory.setData(settlementResult);
        }
    }

    public showResult(show: boolean) {
        if (show) {
            this.updateRoundHistory();
            this.showResultCards(true);

            const choiceWin = this.getWinItem(this.currentDataLogs[0].settlementResult);
            const winItem = this.betTypes[choiceWin];
            if (winItem !== "") {
                this.gameAudios.playShowResultAudio();
                this.resultFrame.active = true;
                this.resultFrame.children.forEach((child) => (child.active = child.name === winItem));
                this.highlightWonItem(true, winItem);
            }
        } else {
            this.showResultCards(false);
            this.highlightWonItem(false);
            this.resultFrame.active = false;
        }
    }

    public playAnimationResult() {
        this.animatedTime.node.active = false;
        this.updateResultCards();
        this.resultAnimation.play();
        this.resultAnimating = true;
    }

    public playDrawAnimation() {
        this.showResult(false);
        this.drawAnimation.play();
        this.audioDrawCard.setCurrentTime(0.2);
        this.audioDrawCard.play();
        cc.tween(this.node)
            .delay(0.2)
            .call(() => {
                this.audioDrawCard.stop();
                this.audioDrawCard.setCurrentTime(0.2);
                this.audioDrawCard.play();
            })
            .delay(0.2)
            .call(() => {
                this.audioDrawCard.stop();
            })
            .start();
    }

    openGuide() {
        if (!this.gameConfigs) {
            return;
        }
        const lang = NoticeUtil.getCurrentLanguage();
        const gameName = GameInfos[this.gameId].key;
        GameUtils.loadResource(`guides/${gameName}_${lang}`).then((prefab) => {
            const node = cc.instantiate(prefab);
            const guide = node.getComponent(DragonTigerGuide);
            guide.init(this.gameConfigs);
            this.currentMiniPanel.addDialog(node);
        });
    }

    openScoreBoard() {
        cc.GameManager.playClick();

        const node = cc.instantiate(this.roundHistoryPrefab);
        this.roundHistory = node.getComponent(DragonTigerRoundHistory);
        this.roundHistory.init(this);
        this.currentMiniPanel.addDialog(node);
        this.updateRoundHistory();
    }
}
