import { Socket } from "socket.io-client";

import BaseComponent from "../../../common/control/BaseComponent";
import PaginationCommon from "../../../common/control/pagination/PaginationCommon";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class SocketIOGameHistoryBase extends BaseComponent {
    @property(PaginationCommon)
    pagination: PaginationCommon = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    mainFrame: cc.Node = null;

    private socket: Socket;

    onUpdatedData = () => {};

    init(socket: Socket) {
        this.socket = socket;
    }

    onLoad() {
        this.pagination.init(this);

        const commonDialog = this.mainFrame.getComponent("CommonDialog");
        commonDialog.onDidHide = () => {
            this.node.destroy();
        };
    }

    onEnable() {
        this.get_data();
    }

    get_data(page = 1) {
        this.socket && this.socket.connected && this.socket.emit("getHistory", { page: page });
    }

    onData(data) {
        const { page, pageSize, total, betLogs } = data;
        this.pagination.onSet(page, pageSize, total);
        this.content.destroyAllChildren();

        if (!betLogs || !betLogs.length) {
            return;
        }

        betLogs.forEach((betLog, index) => this.bindItemRowData(betLog, index));
        this.onUpdatedData();
    }

    abstract bindItemRowData(betLog, index);
}
