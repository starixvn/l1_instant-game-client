import MiniPanel from "./common/control/mini-panel/MiniPanel";
import { sentryLogger } from "./common/logger.js";
import NameGenerator from "./common/name-generator/NameGenerator";
import { GameIds } from "./configs/SabaConfigs";
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
    content: cc.Node = null;

    @property(cc.Node)
    miniPanelNode: cc.Node = null;

    generateNameCount = 0;
    miniPanel: MiniPanel;

    onLoad() {
        this.initLanguage();
        cc.GameManager = GameManager.Instance;
        this.miniPanel = this.miniPanelNode.getComponent(MiniPanel);
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
        // console.log("user ", user);
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
        if (window.openGameId) {
            gameId = parseInt(window.openGameId);
            window.openGameId = null;
        }

        if (gameId === 0) {
            gameId = GameIds.MiniSedie;
        }

        this.splash.active = false;
        this.openGame(gameId);
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
