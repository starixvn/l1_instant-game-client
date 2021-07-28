import * as i18n from "i18n/runtime-scripts/LanguageData";

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

const { ccclass, property } = cc._decorator;
@ccclass
export default class MiniPanel extends BaseComponent {
    @property(cc.Node)
    miniGames: cc.Node = null;

    @property(cc.Node)
    dialog: cc.Node = null;

    @property(cc.Prefab)
    noticePrefab: cc.Prefab = null;

    @property(Loading)
    loading: Loading = null;

    @property(cc.Node)
    noticeContainer: cc.Node = null;

    public dataHandlers: MiniPanelDataHandlers;
    public currentGameRoomId: number;
    public skipShowApiErrorGameIds: number[] = [];
    private gameMiniInitializers: MiniPanelMiniGameInitializers;
    private miniGamesCache = {};

    onLoad() {
        this.showLoading(false);

        this.dataHandlers = new MiniPanelDataHandlers(this);
        this.gameMiniInitializers = new MiniPanelMiniGameInitializers(this);
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
        cc.GameManager.forceKickedOut();
        authManager.signOut();
    }

    playClick() {
        cc.GameManager.playClick();
    }

    playUnClick() {
        cc.GameManager.playUnClick();
    }

    openNewSocketMiniGame(id) {
        this.gameMiniInitializers.openNewSocket(id);
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
        this.showLoading(false);
    }

    redirectToLobby() {
        const currentSceneName = cc.director.getScene().name;

        currentSceneName !== "MainGame" && cc.director.loadScene("MainGame");
    }

    addDialog(dialogNode: cc.Node) {
        this.dialog.addChild(dialogNode);
    }
}
