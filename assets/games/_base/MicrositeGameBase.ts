import CustomWebView from "../../common/control/CustomWebView";
import { buildMicrositeGameUrl } from "../../common/helper/UrlHelper";
import { FeatureConfig } from "../../configs/FeatureConfigs";
import * as sessionManager from "../../manager/auth/SessionManager";
import { SSOResponse } from "sc-user-service-client/dist/auth";
import GameUtils from "../../common/utils/GameUtils";
import * as AuthManager from "../../manager/auth/AuthManager";
import MiniPanel from "../../common/control/mini-panel/MiniPanel";
import { Promotions, PromotionsEvent } from "../../common/control/promotions/Promotions";

const { ccclass, property } = cc._decorator;

declare global {
    interface Window {
        micrositeGameId: any;
        isUserGesture: boolean;
    }
}

export type MicrositeGameParams = {
    backLobby?: boolean;
    sfxEnable?: boolean;
    sessionTimeout?: boolean;
    gameId?: number;
    splashEnabled?: boolean;
    isUserGesture?: boolean;
    isDisconnect?: boolean;
};

const WebviewEventType = {
    LOADED: "loaded"
};

@ccclass
export default class MicrositeGameBase extends cc.Component {
    @property(CustomWebView)
    webview: CustomWebView = null;

    public miniPanel: MiniPanel = null;
    private isLoadingOtherGame = false;
    private micrositeUrl = "";

    protected onLoad(): void {
        this.stopMainAction();
        this.loadMicrositeGame();
        window.addEventListener("message", this.handleEvent.bind(this));
        this.webview?.node.on(
            WebviewEventType.LOADED,
            () => {
                this.miniPanel?.showLoading(false);
            },
            this
        );
    }

    protected onDestroy(): void {
        this.updateSession();
        window.micrositeGameId = 0;
        window.removeEventListener("message", this.handleEvent.bind(this));
    }

    protected async updateSession() {
        const session = sessionManager.getSession() as any;
        session.time = new Date();
        sessionManager.storeSessionData(session);
        AuthManager.setRecheckInInterval();
    }

    protected stopMainAction() {
        AuthManager.removeRecheckInInterval();
    }

    protected loadMicrositeGame() {
        if (window.micrositeGameId > 0) {
            this.micrositeUrl = buildMicrositeGameUrl(window.micrositeGameId);
            const queryString = this.getMicrositeGameQueryString();
            this.webview && (this.webview.url = `${this.micrositeUrl}/${queryString}`);
        }
    }

    protected getMicrositeGameQueryString() {
        const session = sessionManager.getSession() as unknown as SSOResponse;

        const params = {
            ss: session.ss,
            uname: session.username,
            lang: session.language,
            appType: 3, // instant game
            sfxEnable: cc.GameManager?.isSoundGame(),
            purl: GameUtils.base64Encode(window.location.href)
        };
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => params[key] !== undefined && searchParams.append(key, params[key]));
        const encodedQueryString = GameUtils.base64Encode(searchParams.toString());
        return `?params=${encodedQueryString}&instant=1`;
    }

    protected async handleEvent({ data }: { data: MicrositeGameParams }) {
        if (data.splashEnabled) {
            this.handleUserGesturePage();
            return;
        }
        if (data.sessionTimeout) {
            this.handleSignOut();
            return;
        }
        if (data.isDisconnect) {
            this.handleDisconnect();
            return;
        }
        if (data.backLobby && !this.isLoadingOtherGame) {
            this.isLoadingOtherGame = true;
            this.onClickJoinGame(data.gameId);
            return;
        }
        if (data.sfxEnable !== undefined && FeatureConfig.PortraitMode) {
            cc.GameManager.setSoundGame(data.sfxEnable);
        }
    }

    private handleSignOut() {
        window.micrositeGameId = 0;
        AuthManager.signOut();
    }

    private async handleDisconnect() {
        const gameName = await GameUtils.getRemoteDisplayGameName(window.micrositeGameId);
        this.node.destroy();
        this.miniPanel?.onConnectSocketFailed(gameName);
    }

    private postMessageToMicrosite(data: any) {
        this.webview?._impl._iframe.contentWindow.postMessage(data, this.micrositeUrl);
    }

    protected async onClickJoinGame(gameId: number) {
        Promotions.getInstance().emit(PromotionsEvent.OPEN_GAME, gameId);
    }

    private async handleUserGesturePage() {
        this.postMessageToMicrosite({ isUserGesture: true });
    }

    openGuide() {
        this.postMessageToMicrosite({ openGameGuide: true });
    }

    setSound(bool: boolean) {
        this.postMessageToMicrosite({ sfxEnable: bool });
    }
}
