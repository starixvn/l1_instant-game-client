import * as configs from "../../../configs/Configs";
import { lazyInject } from "../../../manager/Application";
import { removeInRoomGameId } from "../../../manager/auth/SessionManager";
import SocketIOController from "../../../manager/SocketIOController";
import { buildServerUrl, getProxyRoute } from "../../helper/UrlHelper";
import GameUtils from "../../utils/GameUtils";
import MiniPanel from "./MiniPanel";

export default class MiniPanelSocketIOGameInitializers {
    @lazyInject(SocketIOController)
    private readonly socketIOController: SocketIOController;

    constructor(private readonly main: MiniPanel) {}

    public openGame(gameId) {
        cc.GameManager.playClick();

        if (this.main.currentGameRoomId === gameId) {
            return;
        }

        this.main.loading.node.active = true;
        cc.GameManager.inGame.outRoomGame().then(() => {
            removeInRoomGameId();
            this.openNewSocket(gameId);
        });
    }

    private openNewSocket(gameId) {
        this.socketIOController.closeSocket(gameId).then(() => {
            const gameName = GameUtils.getGameNameString(gameId);
            const proxyRoute = getProxyRoute(gameId);
            const gameServerUrl = buildServerUrl(configs.ssl, "http", "", gameId);
            const socket = this.socketIOController.connectGameSocket(
                gameServerUrl,
                gameName,
                proxyRoute,
                this.main.onConnectSocketFailed.bind(this.main)
            );
            socket.on("message", (data) => {
                if (data.um) {
                    this.socketIOController.closeSocket(gameId);
                    if (data.um_message) {
                        this.main.handleUmMessage(data.um_message);
                    }
                }
                if (!this.main.isAlive()) {
                    return;
                }
                this.main.loading.node.active = false;
                this.main.onGeneralData(data);
            });

            socket.on("forceDisconnect", () => {
                socket.disconnect();
            });

            this.socketIOController.gameSockets[gameId] = socket;
        });
    }
}
