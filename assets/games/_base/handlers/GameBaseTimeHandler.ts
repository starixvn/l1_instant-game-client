import { numberPad } from "../../../common/helper/NumberHelper";
import GameBase, { GameState } from "../GameBase";
import WebSocketTableGameBase from "../WebSocketTableGameBase";
import DataHandler from "./DataHandler";

export interface IGameBaseTimeHandler extends DataHandler {
    playTimeInterval: number;
    playTime(): void;
    stopPlayTime(): void;
    resetTime(): void;
    isInWaitTime: boolean;
    isInLockBetTime: boolean;
    isStartingNewGameRound: boolean;
}

export default class GameBaseTimeHandler implements IGameBaseTimeHandler {
    playTimeInterval: number;

    constructor(protected readonly main: GameBase) {}

    get isInLockBetTime() {
        return this.main.currentTimeRemaining <= this.main.config.stopBetTime;
    }

    get isInWaitTime() {
        return this.main.currentTimeRemaining > this.main.config.betTime;
    }

    get isStartingNewGameRound() {
        return this.main.currentTimeRemaining === this.main.config.betTime;
    }

    get isInRoundTime() {
        return this.main.currentTimeRemaining >= this.main.config.minBetTime;
    }

    handle(data: any): boolean {
        if (data.remainingTime) {
            if ((data.remainingTime || data.remainingTime >= 0) && !this.main.isStopGame) {
                this.setCurrentTimeRemaining(data);
                this.playTime();
                this.main.hideUmMessage();
                this.main.gameState = GameState.Started;

                return true;
            }
        }

        return false;
    }

    resetTime(): void {
        if (this.main.animatedTime) {
            this.main.animatedTime.node.active = false;
        }
        this.main.currentTimeRemaining = this.main.config.fullTime;
        this.playTime();
    }

    playTime(): void {
        this.playTimeInterval && clearInterval(this.playTimeInterval);

        this.playTimeInterval = setInterval(() => {
            this.gameUpdate();
        }, 1000);
    }

    gameUpdate(): void {
        if (this.isInWaitTime) {
            this.handleWaitTime();
        } else {
            if (this.isStartingNewGameRound) {
                this.handleStartingNewGameRound();
            }

            if (this.isInRoundTime) {
                this.handleInRoundTime();

                const isInLockBetTime = this.main.currentTimeRemaining <= this.main.config.stopBetTime;

                if (isInLockBetTime) {
                    if (this.main.currentTimeRemaining === this.main.config.stopBetTime) {
                        this.handleAtLockBetTime();
                    }
                    this.handleInLockBetTime();
                }
            } else {
                this.handleInEndTime();
            }
        }
        this.main.currentTimeRemaining--;
    }

    handleAtLockBetTime() {}

    stopPlayTime(): void {
        this.playTimeInterval && clearInterval(this.playTimeInterval);
    }

    handleWaitTime() {
        if (this.main.timeWaitNode) {
            this.main.finishShowResult && this.showWaitTime();
        }

        if (this.main.animatedTime) {
            this.main.animatedTime.node.active = false;
        }

        this.main.showProcessingWarning(false);
        this.main.setGameRound(this.main.roundId - 1);
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - this.main.config.betTime - 1);
    }

    showWaitTimeOptions(context: any) {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(this.main.currentTimeRemaining - context.shakeThePlateTime - 1);
    }

    handleStartingNewGameRound() {
        this.main.clearAllNotices();
        this.main.node.activeInHierarchy && this.main.gameAudios && this.main.gameAudios.playStartGameAudio();
        this.main.resetDataAndUI();

        const mainRoomGame = this.main as WebSocketTableGameBase;

        if (mainRoomGame && mainRoomGame.playerHandler) {
            mainRoomGame.playerHandler.updateTablePlayers();
        }
    }

    handleStartingNewGameRoundOptions(context: any) {
        context.highlightLastResult();

        if (cc.RedT.GAME_IS_SHOWED) {
            context.finishShakeThePlate = false;
            context.shakeAnimation.node.active = true;
            context.shakeAnimation.play();
            cc.tween(context)
                .delay(0.3)
                .call(() => cc.RedT.isSoundGame() && context.shakeAudio.play())
                .start();

            context.finishShakeThePlate = true;
        }
    }

    handleInRoundTime() {
        this.showRoundTime();
        this.main.setGameRound(this.main.roundId);
    }

    /**
     * using SicBo && vipFishPrawnCrab
     */
    handleInRoundTimeOptions(context: any) {
        context.setGameRound(context.roundId);

        if (context.currentTimeRemaining <= context.config.betTime) {
            this.showRoundTime();
            if (!context.finishShakeThePlate) {
                context.shakeAnimation.node.active = true;
                const duration = context.shakeAnimation.defaultClip.duration;
                context.shakeAnimation.play("Shake", duration);
                context.finishShakeThePlate = true;
            }
        }
    }

    showRoundTime() {
        if (this.main.timeWaitNode) {
            this.main.timeWaitNode.active = false;
        }
        const time = this.formatTime(this.main.currentTimeRemaining);
        this.main.animatedTime && this.main.animatedTime.setTime(time);
    }

    handleInLockBetTime() {}
    handleInLockBetTimeOptions(context: any) {
        context.betItems.forEach((item: any) => item.resetHighlight());
    }

    handleInEndTime() {
        this.main.setGameRound(this.main.roundId);
        if (this.main.timeWaitNode) {
            this.main.timeWaitNode.active = false;
        }

        if (this.main.animatedTime) {
            this.main.animatedTime.node.active = false;
        }
        clearInterval(this.playTimeInterval);
    }

    protected formatTime(time: number): string {
        return numberPad(time, 2);
    }

    protected setCurrentTimeRemaining(data: any) {
        this.main.currentTimeRemaining = data.remainingTime - 1;
    }
}
