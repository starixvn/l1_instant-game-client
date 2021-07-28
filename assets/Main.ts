import MiniPanel from "./common/control/mini-panel/MiniPanel";
import { sentryLogger } from "./common/logger.js";
import NameGenerator from "./common/name-generator/NameGenerator";
import { GameIds } from "./configs/SabaConfigs";
import * as authManager from "./manager/auth/AuthManager";
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

    @property(MiniPanel)
    miniPanel: MiniPanel = null;

    generateNameCount = 0;

    onLoad() {
        cc.GameManager = GameManager.Instance;
        this.splash.active = true;
        this.checkSSO();
    }

    checkSSO() {
        authManager.preChecking(() => {
            authManager.checkSSO(this.splashMessage, () => {
                if (window.reCheckInId) {
                    clearInterval(window.reCheckInId);
                }
                window.reCheckInId = setInterval(() => {
                    authManager.reCheckIn();
                }, 60 * 1000);

                this.signIn();
            });
        });
    }

    signIn() {
        authManager.triggerSignIn(this);
    }

    handleUserData(user) {
        console.log("user ", user);
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
        let gameId = GameIds.SeDie;
        if (window.openGameId) {
            gameId = parseInt(window.openGameId);
            window.openGameId = null;
        }

        this.splash.active = false;
    }
}
