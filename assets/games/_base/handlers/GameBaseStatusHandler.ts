import GameBase from "../GameBase";
import WebSocketTableGameBase from "../WebSocketTableGameBase";
import DataHandler from "./DataHandler";

export interface IGameBaseStatusHandler extends DataHandler {
    currentStatusData: any;
}

export class GameBaseStatusHandler implements IGameBaseStatusHandler {
    public currentStatusData: any;

    constructor(protected readonly main: GameBase) {}

    protected timeout: number;

    handle(data: any): boolean {
        if (data.status) {
            this.currentStatusData = data.status;
            this.status(this.currentStatusData.win, this.currentStatusData.bet);
        }

        return true;
    }

    clearTimeout() {
        this.timeout && clearTimeout(this.timeout);
    }

    status(win: boolean, bet: number): void {
        const mainRoomGame = this.main as WebSocketTableGameBase;
        if (mainRoomGame && mainRoomGame.enablePlaceChips) {
            return;
        }

        if (!cc.RedT.GAME_IS_SHOWED) {
            return;
        }

        this.timeout = setTimeout(() => {
            this.showStatus(win, bet);
        }, 2e3);
    }

    showStatus(win: boolean, bet: number) {
        if (!cc.RedT.GAME_IS_SHOWED) {
            return;
        }
        if (win) {
            this.main.showWinningBet(bet);
            this.main.updateUserBalance();
        }
    }
}
