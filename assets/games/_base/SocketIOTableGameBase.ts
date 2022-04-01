import { Socket } from "socket.io-client";

import { removeInRoomGameId, storeInRoomGameId } from "../../manager/auth/SessionManager";
import WebSocketTableGameBase from "./WebSocketTableGameBase";

const { ccclass } = cc._decorator;

@ccclass
export default class SocketIOTableGameBase extends WebSocketTableGameBase {
    protected socket: Socket;

    onLoad() {
        super.onLoad();

        storeInRoomGameId(this.gameId);
        this.currentMiniPanel.currentGameRoomId = this.gameId;

        this.socket = this.socketIOController.gameSockets[this.gameId];
        if (!this.socket) {
            this.closeGame();
        } else {
            this.socket.on(this.gameName, (data) => {
                if (!this.isAlive()) {
                    return;
                }
                this.onDataGameRoom(data);
            });
            this.socket.on("disconnect", () => {
                if (!this.isAlive()) {
                    return;
                }
                this.closeGame();
            });
            this.socket.on("message", (data) => {
                if (!this.isAlive()) {
                    return;
                }
                this.currentMiniPanel.onGeneralData(data);
            });
        }
    }

    start() {
        cc.GameManager.sendToMainSocket({ scene: this.gameName });
        this.socket && this.socket.connected && this.socket.emit("inGame");
    }

    onDestroy() {
        super.destroy();
        this.socketIOController.closeSocket(this.gameId);
    }

    onDisconnected() {
        // keep in room game when main socket was disconnected
    }

    onData(data) {
        if (!this.isAlive()) {
            return;
        }
        this.currentMiniPanel.onGeneralData(data);
        this.onDataGameRoomGeneral(data);
    }

    onDataGameRoom(data) {
        super.onDataGameRoom(data);

        this.onDataGameRoomGeneral(data);
        !data.notice && this.currentMiniPanel.onGeneralData(data);
    }

    onCloseGameClick() {
        super.onCloseGameClick();
        removeInRoomGameId();
    }

    sendRetryMessage() {
        if (this.socket) {
            this.socket.emit("retry");
        }
    }

    sendBetData(data) {
        this.socket && this.socket.connected && this.socket.emit("bet", data);
    }
}
