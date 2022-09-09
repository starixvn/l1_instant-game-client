import { Socket } from "socket.io-client";
import { enableMsgpackParserOnGame } from "../../../configs/Configs";

import { FeatureConfig } from "../../../configs/FeatureConfigs";
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

    openMiniGame(gameId: number, connect: boolean) {
        const gameBase = this.main.getGameMini(gameId);
        const isAlreadyOpened = gameBase !== undefined;

        if (!isAlreadyOpened) {
            const prefix = FeatureConfig.PortraitMode ? "portrait-mode/" : "";
            const prefabPath = `games/${prefix}${this.getGameName(gameId)}`;
            this.main.loading.setDefaultPercent();

            cc.loader.loadRes(
                prefabPath,
                (completedCount, total, item) => {
                    if (this.main.currentGameId === gameId && this.main.loading) {
                        this.main.loading.onProgress(completedCount, total, item);
                    }
                },
                (err: Error, prefab: any) => {
                    this.handleCompleteLoadResource({ gameId, prefab, connect, err });
                }
            );
        } else {
            this.showGame(gameBase.node, connect);
        }
    }

    private handleCompleteLoadResource({
        gameId,
        prefab,
        connect,
        err
    }: {
        gameId: number;
        prefab: cc.Prefab;
        connect: boolean;
        err: Error;
    }) {
        this.main.showLoading(false);
        if (!this.main.isAlive()) {
            return;
        }
        if (err || prefab === null) {
            this.main.onForceReload();
            return;
        }

        if (this.main.currentGameId === gameId) {
            const node = cc.instantiate(prefab);
            const gameComponent = node.getComponent(GameBase);
            gameComponent.initMiniPanel(this.main);
            this.main.addMiniGame(gameComponent, gameId);
            this.showGame(node, connect);
        }
    }

    openNewSocket(gameId) {
        this.main.showLoading(true);
        const currentSocket: Socket = this.socketIOController.gameSockets[gameId];

        if (currentSocket && currentSocket.connected) {
            this.openMiniGame(gameId, true);
        } else {
            const gameName = GameUtils.getGameNameString(gameId);
            const socket = this.setUpSocketForGame(gameName, gameId, true, null);
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

    setUpSocketForGame(gameName: string, gameId: number, forceNew: boolean, gameContainer: any): Socket {
        const proxyRoute = getProxyRoute(gameId);
        const gameServerUrl = buildServerUrl("http", "", gameId);

        const socket = this.socketIOController.connectGameSocket(
            gameServerUrl,
            gameName,
            proxyRoute,
            this.main.onConnectSocketFailed.bind(this.main),
            false,
            enableMsgpackParserOnGame?.[gameId]
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

        return socket;
    }
}
