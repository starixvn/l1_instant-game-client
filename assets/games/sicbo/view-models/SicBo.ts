import * as _ from "lodash";

import MiniPanel from "../../../common/control/mini-panel/MiniPanel";
import GameUtils from "../../../common/utils/GameUtils";
import { GameIds } from "../../../configs/SabaConfigs";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import SicBoBetHandler from "./handlers/SicBoBetHandler";
import SicBoFinishHandler from "./handlers/SicBoFinishHandler";
import SicBoLogsHandler from "./handlers/SicBoLogsHandler";
import SicBoTimeHandler from "./handlers/SicBoTimeHandler";
import SicBoBetItem from "./SicBoBetItem";
import SicBoConfigs from "./SicBoConfigs";
import SicBoOddsItem from "./SicBoOddsItem";
import SicBoResult from "./SicBoResult";

const { ccclass, property } = cc._decorator;

export const SicBoId = 25;

@ccclass
export default class SicBo extends SocketIOMiniGameBase {
    public get shakeThePlateTime() {
        return this.config.betTime + 3;
    }

    @property(cc.Sprite)
    dices: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    characterIcons: cc.SpriteFrame[] = [];

    @property({ type: SicBoOddsItem })
    oddsItems: SicBoOddsItem[] = [];

    @property(cc.Animation)
    openDiskAnimation: cc.Animation = null;

    @property(cc.Animation)
    shakeAnimation: cc.Animation = null;

    @property(cc.AudioSource)
    shakeAudio: cc.AudioSource = null;

    @property(cc.Node)
    randomResult: cc.Node = null;

    @property(cc.Node)
    betChoiceStatistic: cc.Node = null;

    @property(cc.SpriteAtlas)
    sicboAtlas: cc.SpriteAtlas = null;

    @property(cc.Node)
    roundHistoryContainer: cc.Node = null;

    @property(SicBoResult)
    resultNode: SicBoResult = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    public finishShakeThePlate = false;

    bigStatistic = 0;
    smallStatistic = 0;
    anyTripleStatistic = 0;
    specific1Statistic = 0;
    specific2Statistic = 0;
    specific3Statistic = 0;
    specific4Statistic = 0;
    specific5Statistic = 0;
    specific6Statistic = 0;

    Md5OfLength = 37;
    Md5delayShowRawValue = 3;
    Md5IsShowTooltip = false;
    Md5NodeWidth = 395;

    onLoad() {
        super.onLoad();
        this.relocationChipNode();
        this.shakeAnimation.node.active = false;
        this.animatedTime.setAnimatedY(30, -5);
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
        this.gameId = GameIds.SicBo;
        this.setConfig(new SicBoConfigs());
    }

    resetDataAndUI() {
        super.resetDataAndUI();

        this.openDiskAnimation.node.active = false;
    }

    initHandlers() {
        super.initHandlers();
        this.finishHandler = new SicBoFinishHandler(this);
        this.logsHandler = new SicBoLogsHandler(this);
        this.timeHandler = new SicBoTimeHandler(this);
        this.betHandler = new SicBoBetHandler(this);
    }

    public updateOddsFromConfigs() {
        super.updateOddsFromConfigs();
        this.gameConfigs.odds && this.oddsItems.forEach((item) => item.setValue(this.gameConfigs.odds[item.node.name]));
    }

    setResult() {
        if (this.currentDataLogs.length > 0) {
            const { result } = this.currentDataLogs[0];
            this.setDices(_.values(result));
            this.resultNode.setData(this.currentDataLogs);
        }
    }

    setDices(dices: number[]) {
        const randomOption = this.randomResult.children[this.roundId % 5];

        dices.forEach((dice, index) => {
            this.dices[index].node.position = randomOption.children[index].position;
            this.dices[index].spriteFrame = this.characterIcons[dice - 1];
            this.dices[index].node.active = true;
        });
    }

    highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];

        if (dataLog) {
            this.betItems.forEach((betItem: SicBoBetItem) => {
                const choice = betItem.node.name;
                betItem.setHighlight(dataLog?.settlementResult[choice], false);
            });
        }
    }

    highlightWinningBetItems() {
        if (this.currentDataLogs.length > 0) {
            const { settlementResult } = this.currentDataLogs[0];
            this.betItems.forEach((betItem: SicBoBetItem) => {
                const choice = betItem.node.name;
                betItem.setHighlight(settlementResult[choice], true);
            });
        }
    }

    resetStatistic() {
        this.bigStatistic = 0;
        this.smallStatistic = 0;
        this.anyTripleStatistic = 0;
        this.specific1Statistic = 0;
        this.specific2Statistic = 0;
        this.specific3Statistic = 0;
        this.specific4Statistic = 0;
        this.specific5Statistic = 0;
        this.specific6Statistic = 0;
    }

    updateStatistic(data: any) {}

    public updateRoundHistory() {
        if (this.roundHistory && this.roundHistory.isAlive()) {
            this.roundHistory.setData(this.currentDataLogs);
        }
    }

    checkConditionUpdateRoundHistory() {
        const finishHandler = this.finishHandler as GameBaseFinishHandler;

        return () =>
            this.currentTimeRemaining < this.config.stopBetTime ||
            this.currentTimeRemaining > this.config.fullTime - finishHandler.getResultAnimationTime();
    }
}
