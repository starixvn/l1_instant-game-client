import Connection from "../connection/Connection";
import { events } from "../connection/SocketIOConnection";

export default class BetHistory extends cc.Component {
    protected connection: Connection;
    protected gameName: string;
    protected currentRoundId: number;

    private callback: any;

    setConnection(connection: Connection, gameName: string, currentRoundId?: number) {
        this.connection = connection;
        this.gameName = gameName;
        this.currentRoundId = currentRoundId;
        this.callback = (data) => this.onData(data);
        this.connection.on(gameName, this.callback);
    }

    onDestroy() {
        this.connection.removeListener(this.gameName, this.callback);
    }

    getHistory(page = 1) {
        this.connection && this.connection.emit(events.getHistory, { page, roundId: this.currentRoundId });
    }

    setId(id: number) {
        this.currentRoundId = id;
    }

    onData(data: any) {}
}
