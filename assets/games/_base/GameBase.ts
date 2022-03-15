import * as _ from "lodash";

import AnimatedTime from "../../common/control/animated-time/AnimatedTime";
import BaseComponent from "../../common/control/BaseComponent";
import BetChips from "../../common/control/bet-chip/BetChips";
import MiniPanel from "../../common/control/mini-panel/MiniPanel";
import ProcessingWarning from "../../common/control/notice/ProcessingWarning";
import UmWarning from "../../common/control/notice/UmWarning";
import TypingLabel from "../../common/control/TypingLabel";
import GameUtils from "../../common/utils/GameUtils";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { GameInfos } from "../../configs/SabaConfigs";
import DataHandler from "./handlers/DataHandler";
import GameBaseBetHandler from "./handlers/GameBaseBetHandler";
import GameBaseConfigsHandler from "./handlers/GameBaseConfigsHandler";
import GameBaseErrorHandler from "./handlers/GameBaseErrorHandler";
import GameBaseFinishHandler from "./handlers/GameBaseFinishHandler";
import GameBaseLogsHandler from "./handlers/GameBaseLogsHandler";
import GameBaseNoticeHandler from "./handlers/GameBaseNoticeHandler";
import { GameBaseStatusHandler } from "./handlers/GameBaseStatusHandler";
import GameBaseTimeHandler from "./handlers/GameBaseTimeHandler";
import GameBaseUmDataHandler from "./handlers/GameBaseUmDataHandler";
import BetItem from "./view-models/BetItem";
import GameAudios from "./view-models/GameAudios";
import { GameConfigBase } from "./view-models/GameConfigBase";
import GameGuideBase from "./view-models/GameGuideBase";
import GameRoundHistory from "./view-models/GameRoundHistory";

const { ccclass, property } = cc._decorator;

export enum GameState {
    None = 0,
    Started,
    Stopped,
    Disabled
}

@ccclass
export default class GameBase extends BaseComponent {
    @property({ type: BetItem })
    betItems: BetItem[] = [];

    @property(cc.Prefab)
    processWarningPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    miniNoticePrefab: cc.Prefab = null;

    @property(cc.Node)
    noticeNode: cc.Node = null;

    @property(UmWarning)
    umNotice: UmWarning = null;

    @property(cc.Node)
    timeWaitNode: cc.Node = null;

    @property(cc.Label)
    timeWaitLabel: cc.Label = null;

    @property({ type: AnimatedTime })
    animatedTime: AnimatedTime = null;

    @property(cc.Label)
    gameRound: cc.Label = null;

    @property(cc.Prefab)
    roundHistoryPrefab: cc.Prefab = null;

    @property
    enableChips = false;

    protected roundHistory: GameRoundHistory;

    @property({
        type: cc.Node,
        visible: function (this: GameBase) {
            return this.enableChips;
        }
    })
    betChipsContainer: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: function (this: GameBase) {
            return this.enableChips;
        }
    })
    betChipsPrefab: cc.Prefab = null;

    @property({
        visible: function (this: GameBase) {
            return this.enableChips;
        }
    })
    enablePlaceChips = false;

    @property(cc.Node)
    dealerChipBox: cc.Node = null;

    @property(cc.Prefab)
    gameAudiosPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    guidePrefab: cc.Prefab = null;

    protected _gameId: number;

    public set gameId(value: number) {
        this._gameId = value;
        this.gameName = GameInfos[value].key;
    }

    public get gameId(): number {
        return this._gameId;
    }

    public gameState = GameState.None;
    public get isStopGame() {
        return this.gameState === GameState.Stopped;
    }
    public get isDisableGame() {
        return this.gameState === GameState.Disabled;
    }
    public waitingProcessing = false;
    public currentTimeRemaining: number;
    public config: GameConfigBase;
    public gameName: string;
    public currentDataLogs = [];
    public roundId = -1;
    public currentMiniPanel: MiniPanel;
    public gameConfigs: any;
    public finishShowResult = true;
    public isGoingToDisabled = false;

    public umHandler: DataHandler;
    public noticeHandler: DataHandler;
    public statusHandler: GameBaseStatusHandler;
    public betHandler: DataHandler;
    public timeHandler: GameBaseTimeHandler;
    public errorHandler: DataHandler;
    public logsHandler: DataHandler;
    public finishHandler: DataHandler;
    public configsHandler: DataHandler;

    public betChips: BetChips;
    public currentBet: number;
    public gameAudios: GameAudios;
    private readonly dataHandlers: DataHandler[] = [];
    private processingWarning: cc.Node;

    setConfig(config: GameConfigBase) {
        this.config = config;
    }

    initMiniPanel(miniPanel: MiniPanel) {
        this.currentMiniPanel = miniPanel;
    }

    isReadyBet(): boolean {
        return !this.isDisableGame && this.gameConfigs !== undefined;
    }

    onLoad() {
        this.setUpHandlers();
        this.initBetChips();
        this.initGameAudios();
        this.setGameRound(0);
        this.resetDataAndUI();
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.connectGameService, this);
    }

    setUpHandlers() {
        this.initHandlers();
        this.addHandlers(
            this.umHandler,
            this.configsHandler,
            this.noticeHandler,
            this.statusHandler,
            this.betHandler,
            this.timeHandler,
            this.errorHandler,
            this.logsHandler,
            this.finishHandler
        );
    }

    onDestroy() {
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.connectGameService, this);
    }

    // onEnable() {
    //     this.startGame();
    //     this.registerViewGame();
    // }

    onDisable() {
        this.stopGame();
    }

    onData(data: any) {
        for (let index = 0; index < this.dataHandlers.length; index++) {
            const handler = this.dataHandlers[index];
            if (index === 0 && handler.handle(data)) {
                //um handler
                break;
            } else {
                handler.handle(data);
            }
        }
    }

    openGame() {
        this.node.active = true;
    }

    closeGame() {
        cc.GameManager.playUnClick();
        this.node.active = false;
    }

    /** Clear all intervals and timeouts in game */
    stopGame() {
        this.gameState = GameState.Stopped;
        this.clearIntervalAndTimeout();
        this.resetDataAndUI();
    }

    disableGame() {
        this.gameState = GameState.Disabled;
        this.clearIntervalAndTimeout();
        this.resetDataAndUI();
    }

    protected startGame() {
        this.gameState = GameState.Started;
    }

    /** Register with game on server */
    protected registerViewGame() {
        this.sendData({ view: true, get_time: true, getLogs: true });
    }

    onSignIn() {
        if (!this.node.active) {
            return;
        }

        this.registerViewGame();
    }

    sendData(payload: any) {
        cc.GameManager.sendToMainSocket({
            g: {
                [this.gameName]: payload
            }
        });
    }

    showAcceptedBet(bet: number) {
        GameUtils.addFlyingText(this.noticeNode, false, bet, 1);
    }

    showWinningBet(bet: number) {
        const winningBet = GameUtils.addFlyingText(this.noticeNode, true, bet, 4);
        winningBet.name = "winningBet";
    }

    setGameRound(gameRoundId) {
        if (!this.gameRound || gameRoundId < 0) {
            return;
        }

        const gameRound = this.formatGameRound(gameRoundId);
        this.gameRound.string = gameRound;

        const typingLabel = this.gameRound.node.parent.getComponent(TypingLabel);

        if (typingLabel) {
            if (this.timeHandler.isStartingNewGameRound) {
                typingLabel.playTypingEffect();
            } else {
                typingLabel.adjustWidth();
            }
        }
    }

    showProcessingWarning(show: boolean) {
        if (show) {
            if (this.processingWarning && this.processingWarning.isValid) {
                return;
            }
            const node = cc.instantiate(this.processWarningPrefab);
            this.node.addChild(node);
            this.processingWarning = node;
        } else {
            this.unlockBet();
            if (!this.processingWarning || !this.processingWarning.isValid) {
                return;
            }
            this.processingWarning.getComponent(ProcessingWarning).close();
            this.processingWarning = null;
        }
    }

    sendRetryMessage() {}

    lockBet() {
        this.waitingProcessing = true;
        const intervalTime = 3; // 3 seconds
        this.schedule(this.sendRetryMessage, intervalTime, cc.macro.REPEAT_FOREVER, 0);
    }

    unlockBet() {
        this.waitingProcessing = false;
        this.unschedule(this.sendRetryMessage);
    }

    showUmMessage(data: any) {
        if (this.isDisableGame) {
            return;
        }

        this.umNotice && this.umNotice.show(data);
    }

    hideUmMessage() {
        this.umNotice && this.umNotice.hide();
    }

    clearAllNotices() {
        this.noticeNode.destroyAllChildren();
    }

    showMiniWarning(data): cc.Node {
        const notice = cc.instantiate(this.miniNoticePrefab);
        const noticeComponent = notice.getComponent("mini_warning");
        noticeComponent.text.string = data;
        this.noticeNode.addChild(notice);
        return notice;
    }

    resetDataAndUI() {
        _.forEach(this.betItems, (item) => {
            item.clearBet();
            item.resetHighlight();
        });

        if (this.animatedTime) {
            this.animatedTime.node.active = false;
        }

        if (this.timeWaitNode) {
            this.timeWaitNode.active = false;
        }

        if (this.statusHandler) {
            this.statusHandler.currentStatusData = null;
        }

        if (this.dealerChipBox) {
            this.dealerChipBox.destroyAllChildren();
        }

        this.node.stopAllActions();

        this.clearAllNotices();
    }

    protected formatGameRound(gameRoundId: any) {
        return gameRoundId ? `#${gameRoundId}` : "";
    }

    protected onGameHide() {
        this.stopGame();
    }

    public connectGameService() {
        this.startGame();
        this.registerViewGame();
    }

    protected bet(betData) {
        if (!this.isReadyBet()) {
            return;
        }

        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
        } else {
            this.lockBet();
            this.sendData(betData);
        }
    }

    protected initBetChips() {
        if (this.enableChips) {
            const betChipsNode = cc.instantiate(this.betChipsPrefab);
            this.betChipsContainer.addChild(betChipsNode);
            this.betChips = betChipsNode.getComponent(BetChips);
            this.betChips.init((bet) => {
                this.onChangedBetChip(bet);
            });
        }
    }

    protected onChangedBetChip(bet) {
        this.currentBet = parseInt(bet);
    }

    protected initGameAudios() {
        if (!this.gameAudiosPrefab) {
            return;
        }
        const gameAudiosNode = cc.instantiate(this.gameAudiosPrefab);
        this.gameAudios = gameAudiosNode.getComponent(GameAudios);
        this.node.addChild(gameAudiosNode);
    }

    protected initHandlers() {
        this.umHandler = new GameBaseUmDataHandler(this);
        this.noticeHandler = new GameBaseNoticeHandler(this);
        this.statusHandler = new GameBaseStatusHandler(this);
        this.betHandler = new GameBaseBetHandler(this);
        this.timeHandler = new GameBaseTimeHandler(this);
        this.errorHandler = new GameBaseErrorHandler(this);
        this.logsHandler = new GameBaseLogsHandler(this);
        this.finishHandler = new GameBaseFinishHandler(this);
        this.configsHandler = new GameBaseConfigsHandler(this);
    }

    protected addHandlers(...handlers: DataHandler[]): void {
        this.dataHandlers.push(...handlers);
    }

    protected clearIntervalAndTimeout() {
        this.timeHandler.stopPlayTime();
        this.statusHandler.clearTimeout();
    }

    public updateOddsFromConfigs() {
        this.gameConfigs.odds && this.betItems.forEach((item) => item.setOdd(this.gameConfigs.odds[item.node.name]));
    }

    public updateDisplayForRemoteConfig() {
        this.updateOddsFromConfigs();

        if (this.betChips) {
            this.betChips.setChipValues(this.gameConfigs);
        }
    }

    public updateUserBalance() {
        cc.GameManager.sendToMainSocket({
            user: {
                updateCoin: true
            }
        });
    }

    public isUsingMaxStakeLevel() {
        return true;
    }

    getBetRange() {
        return this.isUsingMaxStakeLevel() ? this.getVipBetRange() : this.getNormalBetRange();
    }

    protected getNormalBetRange() {
        const { minBet, maxBet } = this.gameConfigs;
        return {
            minBet: minBet,
            maxBet: maxBet
        };
    }

    protected getVipBetRange() {
        const { minBet, maxBet } = this.gameConfigs;
        return {
            minBet: minBet,
            maxBet: Math.min(cc.GameManager.userStakeLevel.maxBet, maxBet)
        };
    }

    openGuide() {
        if (!this.gameConfigs) {
            return;
        }
        const lang = NoticeUtil.getCurrentLanguage();
        const gameName = GameInfos[this.gameId].key;
        GameUtils.loadResource(`guides/${gameName}_${lang}`).then((prefab) => {
            const node = cc.instantiate(prefab);
            const guide = node.getComponent(GameGuideBase);
            guide.init(this.gameConfigs);
            this.currentMiniPanel.addDialog(node);
        });
    }

    openScoreBoard() {
        cc.GameManager.playClick();

        const node = cc.instantiate(this.roundHistoryPrefab);
        this.roundHistory = node.getComponent(GameRoundHistory);
        this.roundHistory.init(this);
        this.currentMiniPanel.addDialog(node);
        this.updateRoundHistory();
    }

    updateRoundHistory() {}

    getBetChoiceString(choice: string): string {
        return GameUtils.getBetChoiceString(choice);
    }
}
