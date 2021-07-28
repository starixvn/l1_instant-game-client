import GameBase from "./GameBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WebSocketMiniGameBase extends GameBase {
    @property(cc.Node)
    background: cc.Node = null;

    onEnable() {
        super.onEnable();
        cc.GameManager.addDataObserver(this.gameName, this.receivedData.bind(this));
    }

    receivedData(data) {
        if (data[this.gameName]) {
            this.onData(data[this.gameName]);
        }
    }

    onDisable() {
        super.onDisable();
        cc.GameManager.removeDataObserver(this.gameName);
    }

    onSignIn() {
        if (!this.node.active) {
            return;
        }

        this.registerViewGame();
    }
}
