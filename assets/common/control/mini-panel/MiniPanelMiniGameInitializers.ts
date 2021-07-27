import * as configs from "../../../configs/Configs";
import { GameIds, GameInfos } from "../../../configs/SabaConfigs";
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
            node.active = true;
            this.main.miniGames && this.main.miniGames.insertChild(node, this.main.miniGames.children.length - 1);

            this.main.loading.node.active = false;
        }
    }

    getGameName(id: number): string {
        return GameInfos[id].key;
    }

    openMiniGame(gameId) {
        this.main.popupMiniGame.hideListGame();
        const prefabPath = `games/minigame/${this.getGameName(gameId)}`;

        const gameBase = this.main.getGameMini(gameId);
        const isAlreadyOpened = gameBase !== undefined;

        if (!isAlreadyOpened) {
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
                        this.main.loading.node.active = false;
                        this.main.onForceReload();
                        return;
                    }

                    const node = cc.instantiate(prefab);
                    const componentName = gameId === GameIds.KenoProViet ? "KenoProViet" : "GameBase";
                    const gameComponent = node.getComponent(componentName);
                    gameComponent.initMiniPanel(this.main);
                    this.main.addMiniGame(gameComponent, gameId);
                    gameComponent.openGame();
                    this.main.loading.node.active = false;
                }
            );
        } else {
            this.showGame(gameBase.node);
        }
    }

    openGame(id) {
        if (!cc.RedT.isConnected) {
            const gameName = GameUtils.getGameNameString(id);
            this.main.onConnectSocketFailed(gameName, false);
            return;
        }

        this.main.loading.node.active = true;

        id = parseInt(id);
        this.openMiniGame(id);
    }

    openNewSocket(gameId) {
        this.main.loading.node.active = true;
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
