import * as configs from "../../../configs/Configs";
import { GameInfos } from "../../../configs/SabaConfigs";
import GameBase from "../../../games/_base/GameBase";
import { lazyInject } from "../../../manager/Application";
import SocketIOController from "../../../manager/SocketIOController";
import { buildServerUrl, getProxyRoute } from "../../helper/UrlHelper";
import GameUtils from "../../utils/GameUtils";
import MiniPanel from "./MiniPanel";

export default class MiniPanelMiniGameInitializers {
    @lazyInject(SocketIOController)
    private readonly socketIOController: SocketIOController;

    constructor(private readonly main: MiniPanel) {}

    showGame(node: cc.Node) {
        if (node) {
            if (this.main.miniGames) {
                this.main.miniGames.children.forEach((child) => (child.active = child === node));
            }
            this.main.showLoading(false);
        }
    }

    getGameName(id: number): string {
        return GameInfos[id].key;
    }

    openMiniGame(gameId) {
        const gameBase = this.main.getGameMini(gameId);
        const isAlreadyOpened = gameBase !== undefined;

        if (!isAlreadyOpened) {
            const prefabPath = `games/${this.getGameName(gameId)}`;
            this.main.loading.setDefaultPercent();
            cc.loader.loadRes(
                prefabPath,
                (completedCount, total, item) => {
                    this.main.loading && this.main.loading.onProgress(completedCount, total, item);
                },
                (err: Error, prefab: any) => {
                    if (!this.main.isAlive()) {
                        return;
                    }
                    if (err || prefab === null) {
                        this.main.showLoading(false);
                        this.main.onForceReload();
                        return;
                    }

                    const node = cc.instantiate(prefab);
                    const gameComponent = node.getComponent(GameBase);
                    gameComponent.initMiniPanel(this.main);
                    this.main.addMiniGame(gameComponent, gameId);
                    gameComponent.openGame();
                    this.showGame(node);
                }
            );
        } else {
            this.showGame(gameBase.node);
        }
    }

    openNewSocket(gameId) {
        this.main.showLoading(true);
        const currentSocket: SocketIOClient.Socket = this.socketIOController.gameSockets[gameId];

        if (currentSocket && currentSocket.connected) {
            this.openMiniGame(gameId);
        } else {
            const gameName = GameUtils.getGameNameString(gameId);
            const proxyRoute = getProxyRoute(gameId);
            const gameServerUrl = buildServerUrl(configs.ssl, "http", "", gameId);
            const socket = this.socketIOController.connectGameSocket(
                gameServerUrl,
                gameName,
                proxyRoute,
                this.main.onConnectSocketFailed.bind(this.main),
                false
            );

            socket.on("signedIn", () => {
                if (!this.main.isAlive()) {
                    return;
                }
                this.openMiniGame(gameId);
            });

            socket.on("forceDisconnect", () => {
                socket.disconnect();
            });

            this.socketIOController.gameSockets[gameId] = socket;
        }
    }
}
