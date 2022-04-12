import { injectable } from "inversify";
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import * as MsgpackParser from "socket.io-msgpack-parser";

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
        isGameRoom: boolean,
        enableMsgpackParser: boolean
    ): Socket => {
        const socketOptions: Partial<ManagerOptions & SocketOptions> = {
            transports: ["websocket"],
            upgrade: false,
            path: proxyRoute
        };

        if (enableMsgpackParser) {
            socketOptions.parser = MsgpackParser;
            console.log(`msgpack is enabled on ${gameName}`);
        }

        const socket = io(socketUri, socketOptions);

        socket.on("connect", () => {
            socket.emit("signin", getSession());
        });

        socket.on("reconnect", () => {
            socket.sendBuffer = [];
        });

        socket.on("connect_failed", () => {
            onConnectFailed(gameName, isGameRoom);
            socket.close();
        });

        socket.on("connect_error", (error) => {
            sentryLogger.logError(error);
            if (!socket.connected) {
                onConnectFailed(gameName, isGameRoom);
            }
            socket.close();
        });

        socket.on("disconnect", (reason) => {
            if (reason === "io server disconnect") {
                // the disconnection was initiated by the server, you need to reconnect manually
                onConnectFailed(gameName, isGameRoom);
            }
        });

        return socket;
    };

    async closeSocket(gameId) {
        const socket: Socket = this.gameSockets[gameId];
        socket && socket.close();
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
