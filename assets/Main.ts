import MiniPanel from "./common/control/mini-panel/MiniPanel";
import { GameIds } from "./configs/SabaConfigs";
import * as authManager from "./manager/auth/AuthManager";

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

    onLoad() {
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
        }
    }

    openGameSSO() {
        let gameId = GameIds.SeDie;
        if (window.openGameId) {
            gameId = parseInt(window.openGameId);
            console.log("window openGameId ", gameId);
            window.openGameId = null;
        }

        this.splash.active = false;
    }
}
