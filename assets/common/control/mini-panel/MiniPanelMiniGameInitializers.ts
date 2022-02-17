import { Socket } from "socket.io-client";

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

    showGame(node: cc.Node, connect: boolean) {
        if (node) {
            if (this.main.miniGames) {
                const miniGameNode = this.main.miniGames.children.find((child) => child === node);
                if (miniGameNode) {
                    const game = miniGameNode.getComponent(GameBase);
                    if (connect) {
                        game.connectGameService();
                    }
                }
            }
            this.main.showLoading(false);
        }
    }

    getGameName(id: number): string {
        return GameInfos[id].key;
    }

    openMiniGame(gameId, connect) {
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
                    this.showGame(node, connect);
                }
            );
        } else {
            this.showGame(gameBase.node, connect);
        }
    }

    openNewSocket(gameId) {
        this.main.showLoading(true);
        const currentSocket: Socket = this.socketIOController.gameSockets[gameId];

        if (currentSocket && currentSocket.connected) {
            this.openMiniGame(gameId, true);
        } else {
            const gameName = GameUtils.getGameNameString(gameId);
            const proxyRoute = getProxyRoute(gameId);
            const gameServerUrl = buildServerUrl("http", "", gameId);
            const socket = this.socketIOController.connectGameSocket(
                gameServerUrl,
                gameName,
                proxyRoute,
                this.main.onConnectSocketFailed.bind(this.main),
                false
            );

            socket.on("message", (data) => {
                if (!this.main.isAlive()) {
                    return;
                }
                if (data.um || data.notPermittedToPlay) {
                    this.openMiniGame(gameId, false);
                }

                if (data.um) {
                    this.socketIOController.closeSocket(gameId);
                    if (data.um_message) {
                        this.main.handleUmMessage(data.um_message);
                    }
                }

                this.main.onGeneralData(data);
            });

            socket.on("signedIn", () => {
                if (!this.main.isAlive()) {
                    return;
                }
                this.openMiniGame(gameId, true);
            });

            socket.on("forceDisconnect", () => {
                socket.close();
            });

            this.socketIOController.gameSockets[gameId] = socket;
        }
    }

    closeSocketGame(gameId: number) {
        this.socketIOController.closeSocket(gameId);
    }
}
