import MiniPanel from "./common/control/mini-panel/MiniPanel";
import { sentryLogger } from "./common/logger.js";
import NameGenerator from "./common/name-generator/NameGenerator";
import * as authManager from "./manager/auth/AuthManager";
import { getCacheLanguage, setLanguage } from "./manager/auth/SessionManager";
import UserService from "./manager/auth/UserService";
import GameManager from "./manager/GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    @property(cc.Node)
    splash: cc.Node = null;

    @property(cc.Label)
    splashMessage: cc.Label = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.Node)
    main: cc.Node = null;

    @property(cc.Node)
    headerContainer: cc.Node = null;

    @property(cc.Node)
    miniPanelNode: cc.Node = null;

    private generateNameCount = 0;
    private miniPanel: MiniPanel;
    private gameHeaders: cc.Toggle[] = [];

    onLoad() {
        cc.GameManager = GameManager.Instance;
        this.headerContainer.children.forEach((child) => {
            const toggle = child.getComponent(cc.Toggle);
            if (toggle) {
                this.gameHeaders.push(toggle);
            }

            cc.GameManager.supportGames.push(+child.name);
        });
        this.initLanguage();
        this.miniPanel = this.miniPanelNode.getComponent(MiniPanel);
        this.miniPanel.updateOfferGameHeaders = () => this.updateOfferGameHeaders();
        GameManager.Instance.miniPanel = this.miniPanel;
        this.splash.active = true;
        this.checkSSO();
    }

    initLanguage() {
        let language = getCacheLanguage();
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("lang")) {
            const lang = urlParams.get("lang");
            language = lang === "vi-VN" ? "vi" : "en";
        }
        setLanguage(language);
    }

    checkSSO() {
        // authManager.preChecking(() => {
        this.splashMessage.string = "";
        authManager.checkSSO(this.splashMessage, () => {
            if (window.reCheckInId) {
                clearInterval(window.reCheckInId);
            }
            window.reCheckInId = setInterval(() => {
                authManager.reCheckIn();
            }, 60 * 1000);

            this.signIn();
        });
        // });
    }

    signIn() {
        authManager.triggerSignIn(this);
    }

    handleUserData(user) {
        cc.GameManager.loadUserData(user);
    }

    serviceAuthorized(authorized: boolean) {
        if (authorized) {
            this.openGameSSO();
        } else {
            if (this.generateNameCount < 21) {
                this.autoGenerateUserName();
                this.generateNameCount++;
            } else {
                sentryLogger.log("Auto generate name over 21 times");
            }
        }
    }

    autoGenerateUserName() {
        const name = NameGenerator.generateName();
        const authData = window.authData;
        UserService.getInstance().auth.signName(authData.ss, authData.username, name).then(this.handleSignName.bind(this));
    }

    handleSignName(response) {
        if (response.authorized) {
            this.handleUserData(response.user);
        }

        this.serviceAuthorized(response.authorized);
    }

    openGameSSO() {
        let gameId = 0;
        let ssoGameId = 0;
        let isGameExcluded = false;
        if (window.openGameId) {
            gameId = parseInt(window.openGameId);
            ssoGameId = gameId;
            window.openGameId = null;
            if (gameId) {
                isGameExcluded = cc.GameManager.isGameExcluded(gameId);
            }
        }

        if (gameId === 0 || isGameExcluded) {
            gameId = cc.GameManager.getFirstOfferGame();
        }

        this.splash.active = false;
        this.updateOfferGameHeaders();
        if (gameId) {
            this.updateSelectedHeader(gameId);
            this.openGame(gameId);
        }
        if (isGameExcluded) {
            this.miniPanel.handleNotPermittedToPlay(ssoGameId, ssoGameId === gameId);
        }
    }

    updateOfferGameHeaders() {
        const offerGames = cc.GameManager.user.offerGames;
        this.gameHeaders.forEach((toggle) => {
            toggle.node.active = offerGames.includes(+toggle.node.name);
        });
    }

    updateSelectedHeader(gameId: number) {
        const name = gameId.toString();
        const toggle = this.gameHeaders.find((comp) => comp.node.name === name);
        if (toggle) {
            toggle.isChecked = true;
        }
    }

    openGame(gameId: number) {
        console.log("open game id " + gameId);
        this.miniPanel.openNewSocketMiniGame(gameId);
    }

    onGuideClick() {
        cc.GameManager.playClick();
        this.miniPanel.openGuide();
    }

    onGameChanged(toggle: cc.Toggle, param: string) {
        if (toggle.isChecked) {
            const gameId = +param;
            this.openGame(gameId);
        }
    }
}
