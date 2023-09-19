import * as i18n from "i18n/runtime-scripts/LanguageData";

import GameBase from "../../../games/_base/GameBase";
import * as authManager from "../../../manager/auth/AuthManager";
import * as sessionManager from "../../../manager/auth/SessionManager";
import { numberWithCommas } from "../../helper/NumberHelper";
import GameUtils from "../../utils/GameUtils";
import NoticeUtil from "../../utils/NoticeUtil";
import BaseComponent from "../BaseComponent";
import Loading from "../Loading";
import Notice, { NoticeData } from "../notice/Notice";
import MiniPanelDataHandlers from "./MiniPanelDataHandlers";
import MiniPanelMiniGameInitializers from "./MiniPanelMiniGameInitializers";
import PromotionAnnouncements from "../promotions/PromotionAnnouncements";
import BoostedOdds, { BoostedOddsEvent } from "../promotions/BoostedOdds";
import { Promotions, PromotionsEvent } from "../promotions/Promotions";
import NotificationService from "../../../manager/auth/NotificationService";
import { isMicrositeGame } from "../../../configs/GameConfigurations";
import MicrositeGameBase from "../../../games/_base/MicrositeGameBase";
import { FeatureConfig } from "../../../configs/FeatureConfigs";

const { ccclass, property } = cc._decorator;
@ccclass
export default class MiniPanel extends BaseComponent {
    @property(cc.Node)
    miniGames: cc.Node = null;

    @property(cc.Node)
    dialog: cc.Node = null;

    @property(cc.Prefab)
    noticePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    connectionLostPrefab: cc.Prefab = null;

    @property(Loading)
    loading: Loading = null;

    @property(cc.Node)
    noticeContainer: cc.Node = null;

    @property(cc.Prefab)
    announcementPrefab: cc.Prefab = null;

    @property(cc.Node)
    announcementContainer: cc.Node = null;

    @property(cc.Prefab)
    promotionIconPrefab: cc.Prefab = null;

    @property(cc.Node)
    promotionIconContainer: cc.Node = null;

    public dataHandlers: MiniPanelDataHandlers;
    public currentGameRoomId: number;
    public skipShowApiErrorGameIds: number[] = [];
    private gameMiniInitializers: MiniPanelMiniGameInitializers;
    private miniGamesCache = {};
    private currentGame: GameBase;
    private currentMicrositeGame: MicrositeGameBase;
    public currentGameId: number;
    public mainCallback: {
        showNoticeNotPermitToPlay: () => void;
        updateOfferGameHeaders: () => void;
        selecAndOpenGame: (gameId: number) => void;
        joinGameCallback: (gameId: number) => void;
    };

    public promotions: BoostedOdds;
    public promotionAnnouncement: PromotionAnnouncements;

    onLoad() {
        this.showLoading(false);

        this.dataHandlers = new MiniPanelDataHandlers(this);
        this.gameMiniInitializers = new MiniPanelMiniGameInitializers(this);
        this.initBoostedOdds();
    }

    onGeneralData(data: any) {
        if (!this.dataHandlers) {
            this.dataHandlers = new MiniPanelDataHandlers(this);
        }

        this.dataHandlers.handleData(data);
        // open result page
        if (data.gameResult) {
            const { redirectUrl } = data.gameResult;
            this.redirectToResultPage(redirectUrl);
        }
    }

    showLoading(show: boolean) {
        this.loading.node.active = show;
    }

    handleUmMessage(data) {
        this.showLoading(false);
        const text = NoticeUtil.getMessageByLocale(data);
        if (text) {
            const noticeData = {
                text: text,
                isInfo: false
            } as NoticeData;
            this.showNotice(noticeData);
        }
    }

    redirectToResultPage(redirectUrl) {
        cc.GameManager.resultPage = window.open(redirectUrl, "", "width=700,height=500");
        if (cc.GameManager.resultPage) {
            cc.GameManager.resultPage.focus();

            window.onbeforeunload = function () {
                cc.GameManager.resultPage.close();
            };
        }
    }

    openResultPage(gameId: number = undefined) {
        const data = { language: sessionManager.getLocale() };
        if (gameId) {
            data["gameId"] = gameId;
        }
        cc.GameManager.sendToMainSocket({ gameResult: data });
    }

    openGuide() {
        if (isMicrositeGame(this.currentGameId)) {
            this.currentMicrositeGame?.openGuide();
            return;
        }
        if (this.currentGame) {
            this.currentGame.openGuide();
        }
    }

    setSoundGame(bool: boolean) {
        if (isMicrositeGame(this.currentGameId) && !FeatureConfig.PortraitMode) {
            this.currentMicrositeGame?.setSound(bool);
        }
    }

    initBoostedOdds() {
        const promotionsNode = cc.instantiate(this.promotionIconPrefab);
        this.promotions = promotionsNode.getComponent(BoostedOdds);
        promotionsNode.on(BoostedOddsEvent.SHOW_PROMOTION_ANNOUNCEMENT, this.showAnnouncement.bind(this));
        Promotions.getInstance().on(PromotionsEvent.SHOW_BOOSTED_ODDS, () => this.promotions?.handleBoostedOdds());
        Promotions.getInstance().on(PromotionsEvent.OPEN_GAME, (gameId) => {
            this.mainCallback.joinGameCallback(gameId);
        });
        this.promotionIconContainer.addChild(promotionsNode);
    }

    showAnnouncement() {
        const node = cc.instantiate(this.announcementPrefab);
        this.promotionAnnouncement = node.getComponent(PromotionAnnouncements);
        this.announcementContainer.addChild(node);
    }

    addMiniGame(game: any, gameId: number) {
        this.addGame(game.node, gameId);
        this.currentGame = game;
    }

    addMicrositeGame(game: MicrositeGameBase, gameId: number) {
        this.addGame(game.node, gameId);
        this.currentMicrositeGame = game;
    }

    addGame(game: cc.Node, gameId: number) {
        this.miniGames?.addChild(game);
        this.miniGamesCache[gameId] = game;
    }

    removeGame(gameId: number) {
        delete this.miniGamesCache[gameId];
        this.miniGames.destroyAllChildren();
        !isMicrositeGame(gameId) && this.gameMiniInitializers.closeSocketGame(gameId);
    }

    getGameMini(gameId): any {
        return this.miniGamesCache[gameId];
    }

    onSignIn() {
        Object.keys(this.miniGamesCache).forEach((key) => {
            const game = this.miniGamesCache[key];
            if (game && game.node && game.node.isValid) {
                game.onSignIn();
            }
        });
    }

    onForceReload(showNotice = true, message = i18n.t("messages.newUpdateAvailable")) {
        const forceReload = () => {
            location.reload();
        };

        if (showNotice) {
            const noticeData = {
                text: message,
                isInfo: true
            } as NoticeData;
            this.showNotice(noticeData, forceReload, forceReload);
        } else {
            forceReload();
        }
    }

    handleNotPermittedToPlay(gameId: number, switchGame: boolean) {
        cc.GameManager.removeGameOffer(gameId);
        this.mainCallback.showNoticeNotPermitToPlay();
        const gameName = GameUtils.getGameNameString(gameId);
        const message = i18n.t("messages.gameExcluded", { gameName: gameName });
        const canNotClose = cc.GameManager.isNoGameOffer();
        const noticeData = {
            text: message,
            isInfo: true,
            canNotClose
        } as NoticeData;
        const callback = () => {
            if (this.mainCallback.updateOfferGameHeaders) {
                this.mainCallback.updateOfferGameHeaders();
            }
            if (switchGame) {
                const firstGameId = cc.GameManager.getFirstOfferGame();
                this.mainCallback.selecAndOpenGame(firstGameId);
            }
        };
        this.showNotice(noticeData, callback, callback);
    }

    forceKickedOut() {
        NotificationService.getInstance().forceKickedOut();
        authManager.signOut();
    }

    playClick() {
        cc.GameManager.playClick();
    }

    playUnClick() {
        cc.GameManager.playUnClick();
    }

    openNewSocketMiniGame(id) {
        if (this.currentGame) {
            this.currentGame.closeGame();
        }
        this.removeGame(this.currentGameId);

        this.currentGameId = id;
        this.currentGame = null;
        this.currentMicrositeGame = null;

        if (isMicrositeGame(id)) {
            GameUtils.openMicrositeGame(id, this);
        } else {
            this.gameMiniInitializers.openNewSocket(id);
        }
    }

    loadGameRoom(name) {
        this.loading.setDefaultPercent();

        cc.director.preloadScene(
            name,
            (completedCount, total, item) => {
                this.loading && this.loading.onProgress(completedCount, total, item);
            },
            (error) => {
                if (error) {
                    this.showLoading(false);
                    this.onForceReload();
                } else {
                    cc.director.loadScene(name);
                }
            }
        );
    }

    showErrorNotice(error): Notice {
        const noticePrefab = cc.instantiate(this.noticePrefab);
        const notice = noticePrefab.getComponent(Notice);

        const gameName = GameUtils.getGameNameString(error.gameTypeId);
        const { minBet, maxBet, gameRoundId, errorCode } = error;
        const opt = { gameName, gameRoundId, errorCode, minBet: numberWithCommas(minBet), maxBet: numberWithCommas(maxBet) };
        const isPlaceBet = error.isPlaceBetFailed;
        const message = NoticeUtil.getLocalizedErrorMessage(errorCode, opt, isPlaceBet);

        notice.init({ text: message } as NoticeData);
        this.noticeContainer.addChild(noticePrefab);

        return notice;
    }

    showNotice(noticeData: NoticeData, handleClickButton: () => void = null, handleClose: () => void = null) {
        const noticePrefab = cc.instantiate(this.noticePrefab);
        const notice = noticePrefab.getComponent(Notice);

        noticeData.button = { text: "OK" };
        notice.init(noticeData);

        if (handleClickButton) {
            notice.handleClickButton = handleClickButton;
        }

        if (handleClose) {
            notice.handleClose = handleClose;
        }

        this.noticeContainer.addChild(noticePrefab);
    }

    showLostConnection(noticeData: NoticeData, handleClickButton: () => void) {
        const node = cc.instantiate(this.connectionLostPrefab);
        const notice = node.getComponent(Notice);

        noticeData.button = { text: i18n.t("ui.reconnect") };
        notice.init(noticeData);

        if (handleClickButton) {
            notice.handleClickButton = handleClickButton;
            notice.handleClose = handleClickButton;
        }

        this.noticeContainer.addChild(node);
    }

    onConnectSocketFailed(gameName, isGameRoom = true) {
        if (!this.isAlive()) {
            return;
        }
        this.removeAllDialogs();
        this.currentGame = null;
        this.currentMicrositeGame = null;
        this.showLostConnection(
            {
                title: gameName,
                text: i18n.t("messages.lostGameConnection", { gameName: gameName })
            } as NoticeData,
            () => this.reloadCurrentGame()
        );
        this.showLoading(false);
    }

    reloadCurrentGame() {
        const currentGameId = this.currentGameId;
        this.removeGame(currentGameId);
        setTimeout(() => {
            this.openNewSocketMiniGame(currentGameId);
        }, 100);
    }

    addDialog(dialogNode: cc.Node) {
        this.dialog.addChild(dialogNode);
    }

    removeAllDialogs() {
        this.dialog.destroyAllChildren();
    }

    removeAllNotices() {
        this.noticeContainer.destroyAllChildren();
    }
}
