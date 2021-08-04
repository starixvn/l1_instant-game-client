import { injectable } from "inversify";
import * as socketIo from "socket.io-client";

import { sentryLogger } from "../common/logger.js";
import { GameInfos } from "../configs/SabaConfigs";
import { getSession } from "../manager/auth/SessionManager";

@injectable()
export default class SocketIOController {
    public gameSockets = {};

    connectGameSocket = (
        socketUri: string,
        gameName: string,
        proxyRoute: string,
        onConnectFailed: (gameName, isGameRoom) => void,
        isGameRoom = true
    ): SocketIOClient.Socket => {
        const socket = socketIo(socketUri, { forceNew: true, transports: ["websocket"], upgrade: false, path: proxyRoute });

        socket.on("connect", () => {
            socket.emit("signin", getSession());
        });

        socket.on("reconnect", () => {
            console.log(`${gameName} socket reconnect`);
            // sentryLogger.logError(`${gameName} socket reconnect`);
            socket.sendBuffer = [];
        });

        socket.on("connect_failed", () => {
            console.log(`${gameName} socket connect failed`);
            socket.disconnect();
            // onConnectFailed(gameName, isGameRoom);
        });

        socket.on("connect_error", (error) => {
            console.log(`${gameName} socket error: ${error}`);
            sentryLogger.logError(error);
            socket.disconnect();
        });

        socket.on("disconnect", (reason) => {
            console.log(`${gameName} socket disconnect: ${reason}`);
            onConnectFailed(gameName, isGameRoom);
            // sentryLogger.log(`${gameName} socket disconnect: ${reason}`);
        });

        return socket;
    };

    async closeSocket(gameId) {
        const socket: SocketIOClient.Socket = this.gameSockets[gameId];
        socket && socket.disconnect();
        this.removeSocket(gameId);
    }

    removeSocket(gameId) {
        delete this.gameSockets[gameId];
    }

    closeAllSocket() {
        const keys = Object.keys(this.gameSockets);

        if (keys && keys.length) {
            keys.forEach(this.closeSocket.bind(this));
        }
    }

    closeMiniGameSockets() {
        const keys = Object.keys(this.gameSockets);
        keys.forEach((gameId) => {
            const info = GameInfos[gameId];
            if (info.mini) {
                this.closeSocket(gameId);
            }
        });
    }
}
