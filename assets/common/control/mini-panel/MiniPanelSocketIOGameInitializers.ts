import { lazyInject } from "../../../manager/Application";
import SocketIOController from "../../../manager/SocketIOController";
import MiniPanel from "./MiniPanel";

export default class MiniPanelSocketIOGameInitializers {
    @lazyInject(SocketIOController)
    private readonly socketIOController: SocketIOController;

    constructor(private readonly main: MiniPanel) {}

    public openGame(gameId) {
        cc.GameManager.playClick();

        if (this.main.currentGameRoomId === gameId) {
            return;
        }

        this.main.showLoading(true);
    }
}
