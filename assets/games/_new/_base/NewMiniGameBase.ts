import SocketIOMiniGameBase from "../../_base/SocketIOMiniGameBase";
import SocketIOConnection from "../connection/SocketIOConnection";

export default class NewMiniGameBase extends SocketIOMiniGameBase {
    protected connection: SocketIOConnection;

    startGame() {
        super.startGame();
        this.initConnection();
    }

    initConnection() {
        this.connection = new SocketIOConnection();
        this.connection.setSocket(this.socket, this.gameName);
    }
}
