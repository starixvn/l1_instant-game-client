import * as i18n from "i18n/runtime-scripts/LanguageData";

import * as authManager from "../../../manager/auth/AuthManager";
import * as sessionManager from "../../../manager/auth/SessionManager";
import { numberWithCommas } from "../../helper/NumberHelper";
import GameUtils from "../../utils/GameUtils";
import NoticeUtil from "../../utils/NoticeUtil";
import BaseComponent from "../BaseComponent";
import GameIconMenu from "../game-menu/GameIconMenu";
import Loading from "../Loading";
import Notice, { NoticeData } from "../notice/Notice";
import MiniPanelDataHandlers from "./MiniPanelDataHandlers";
import MiniPanelMiniGameInitializers from "./MiniPanelMiniGameInitializers";
import MiniPanelSocketIOGameInitializers from "./MiniPanelSocketIOGameInitializers";
import PopupMinigames from "./PopupMinigames";

const { ccclass, property } = cc._decorator;
@ccclass
export default class MiniPanel extends BaseComponent {
    @property(cc.BitmapFont)
    fontCong: cc.BitmapFont = null;

    @property(cc.BitmapFont)
    fontTru: cc.BitmapFont = null;

    @property(cc.Node)
    miniGames: cc.Node = null;

    @property(cc.Node)
    miniMenu: cc.Node = null;

    @property(cc.Node)
    dialog: cc.Node = null;

    @property(cc.Node)
    effectNode: cc.Node = null;

    @property(cc.Prefab)
    noticePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    loadingPrefab: cc.Prefab = null;

    @property(GameIconMenu)
    gameMenu: GameIconMenu = null;

    @property(cc.Node)
    noticeContainer: cc.Node = null;

    @property(cc.Node)
    guideContainer: cc.Node = null;

    public popupMiniGame: any;
    public loading: Loading;
    public dataHandlers: MiniPanelDataHandlers;
    public currentGameRoomId: number;
    public skipShowApiErrorGameIds: number[] = [];
    private gameMiniInitializers: MiniPanelMiniGameInitializers;
    private socketIOGameInitializers: MiniPanelSocketIOGameInitializers;
    private miniGamesCache = {};

    onLoad() {
        if (void 0 === cc.RedT.util.fontCong) {
            cc.RedT.util.fontCong = this.fontCong;
            cc.RedT.util.fontTru = this.fontTru;
        }

        const loadingNode = cc.instantiate(this.loadingPrefab);
        this.loading = loadingNode.getComponent("Loading") as Loading;
        loadingNode.active = false;
        this.node.addChild(loadingNode);

        this.popupMiniGame = this.miniMenu.getComponent(PopupMinigames);
        this.dataHandlers = new MiniPanelDataHandlers(this);
        this.gameMiniInitializers = new MiniPanelMiniGameInitializers(this);
        this.socketIOGameInitializers = new MiniPanelSocketIOGameInitializers(this);
        this.gameMenu.miniPanel = this;
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

    handleUmMessage(data) {
        this.loading.node.active = false;
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
        cc.RedT.resultPage = window.open(redirectUrl, "", "width=700,height=500");
        if (cc.RedT.resultPage) {
            cc.RedT.resultPage.focus();

            window.onbeforeunload = function () {
                cc.RedT.resultPage.close();
            };
        }
    }

    openResultPage(gameId: number = undefined) {
        const data = { language: sessionManager.getLocale() };
        if (gameId) {
            data["gameId"] = gameId;
        }
        cc.RedT.send({ gameResult: data });
    }

    addMiniGame(game: any, gameId: number) {
        this.miniGames && this.miniGames.addChild(game.node);
        this.miniGamesCache[gameId] = game;
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

    forceKickedOut() {
        cc.RedT.forceKickedOut();
        authManager.signOut();
    }

    playClick() {
        cc.RedT.audio.playClick();
    }

    playUnClick() {
        cc.RedT.audio.playUnClick();
    }

    openGame(e, id) {
        this.gameMiniInitializers.openGame(id);
    }

    openNewSocketMiniGame(e, id) {
        this.gameMiniInitializers.openNewSocket(id);
    }

    openNewGameSocket(event, gameId) {
        this.socketIOGameInitializers.openGame(gameId);
    }

    loadGameRoom(name) {
        this.loading.setDefaultPercent();

        cc.director.preloadScene(
            name,
            (completedCount, total, item) => {
                this.loading && this.loading.onProgress(completedCount, total, item);
            },
            (error, assets) => {
                if (error) {
                    this.loading.node.active = false;
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

    showGuide(guide: cc.Node) {
        this.guideContainer.addChild(guide);
    }

    showNotice(noticeData: NoticeData, handleClickButton: () => void = null, handleClose: () => void = null) {
        const noticePrefab = cc.instantiate(this.noticePrefab);
        const notice = noticePrefab.getComponent("Notice") as Notice;

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

    onConnectSocketFailed(gameName, isGameRoom = true) {
        if (!this.isAlive()) {
            return;
        }
        const handleCloseNotice = () => isGameRoom && this.redirectToLobby();

        this.showNotice(
            {
                text: i18n.t("messages.lostGameConnection", { gameName: gameName })
            } as NoticeData,
            handleCloseNotice,
            handleCloseNotice
        );
        this.loading.node.active = false;
    }

    redirectToLobby() {
        const currentSceneName = cc.director.getScene().name;

        currentSceneName !== "MainGame" && cc.director.loadScene("MainGame");
    }

    addDialog(dialogNode: cc.Node) {
        this.dialog.addChild(dialogNode);
    }
}
