import SabaConfigs = require("../../configs/SabaConfigs");
import { lazyInject } from "../../manager/Application";
import SocketIOController from "../../manager/SocketIOController";
import GameBase from "./GameBase";

export default abstract class SocketIOMiniGameBase extends GameBase {
    @lazyInject(SocketIOController)
    private readonly socketIOController: SocketIOController;

    public socket: SocketIOClient.Socket;

    onLoad() {
        super.onLoad();

        if (!cc.sys.isMobile) {
            this.node.scale = SabaConfigs.desktopMiniGameScale;
        }
    }

    startGame() {
        super.startGame();
        this.socket = this.socketIOController.gameSockets[this.gameId];

        if (this.socket) {
            this.socket.off(this.gameName).on(this.gameName, this.onData.bind(this));
            // this.socket.off("disconnect").on("disconnect", this.closeGame.bind(this));
        }
    }

    protected registerViewGame() {
        this.socket && this.socket.connected && this.socket.emit("inGame");
    }

    closeGame() {
        if (!this.isAlive()) {
            return;
        }
        this.sendRetryMessage();
        this.socketIOController.closeSocket(this.gameId);
        this.showProcessingWarning(false);
        super.closeGame();
    }

    onData(data) {
        if (!this.isAlive()) {
            return;
        }
        super.onData(data);

        if (data.user) {
            cc.GameManager.loadUserData(data.user);
        }

        !data.notice && this.currentMiniPanel.onGeneralData(data);
    }

    static adjustPosition(betBoard: any, node: any) {
        const okButtonPositionY = betBoard.okButton.node.parent.convertToWorldSpaceAR(betBoard.okButton.node.position).y;
        const expectPositionY = betBoard.okButton.node.height;
        const paddingBottom = 20;

        if (okButtonPositionY < expectPositionY) {
            const distance = expectPositionY - okButtonPositionY + paddingBottom;

            node.runAction(cc.moveBy(0.5, cc.v2(0, distance)).easing(cc.easeBackOut()));
        }
    }

    public onBetItemClick(e) {
        cc.GameManager.playClick();
        if (!this.isReadyBet()) {
            return;
        }
        if (this.waitingProcessing) {
            this.showProcessingWarning(true);
        } else {
            this.lockBet();
            const betData = {
                amount: this.currentBet,
                betChoice: e.target.name,
                username: cc.GameManager.user.name
            };

            this.socket && this.socket.connected && this.socket.emit("bet", betData);
        }
    }

    sendRetryMessage() {
        if (this.socket) {
            this.socket.emit("retry");
        }
    }
}
