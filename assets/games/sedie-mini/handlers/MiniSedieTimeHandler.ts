import { numberPad } from "../../../common/helper/NumberHelper";
import { GameState } from "../../_base/GameBase";
import GameBaseTimeHandler from "../../_base/handlers/GameBaseTimeHandler";
import MiniSedie from "../MiniSedie";

export default class MiniSedieTimeHandler extends GameBaseTimeHandler {
    constructor(protected readonly main: MiniSedie) {
        super(main);
        main.animation.on("finished", () => {
            this.main.gameAudios && this.main.gameAudios.stopAllAudio();
        });
    }

    playTime(): void {
        if (!cc.GameManager.GAME_IS_SHOWED) {
            return;
        }
        this.main.gameState = GameState.Started;
        this.playTimeInterval && clearInterval(this.playTimeInterval);

        this.playTimeInterval = setInterval(() => {
            const isInWaitTime = this.main.currentTimeRemaining > this.main.config.betTime;

            if (isInWaitTime) {
                this.handleWaitTime();
            } else {
                this.handlePlayTime();
            }
            this.main.currentTimeRemaining--;
        }, 1000);
    }

    handlePlayTime() {
        if (this.main.currentTimeRemaining === this.main.config.minBetTime) {
            this.main.clearAllNotices();
        }

        const isInRoundTime = this.main.currentTimeRemaining >= this.main.config.minBetTime;
        if (isInRoundTime) {
            this.handleInRoundTime();
            const isInLockBetTime = this.main.currentTimeRemaining <= this.main.config.stopBetTime;

            if (isInLockBetTime) {
                this.handleInLockBetTime();
            }
        } else {
            this.main.animatedTime.node.active = false;
            clearInterval(this.playTimeInterval);
        }
    }

    handleInLockBetTime() {
        this.main.animation.node.active = true;
        super.handleInLockBetTime();
        this.main.betItems.forEach((item) => item.setHighlight(false));
    }

    handleWaitTime() {
        this.main.animation.node.active = true;
        this.main.animatedTime.node.active = false;
        this.main.showProcessingWarning(false);

        const shakingDuration = 2;
        const shakeTimePoint = this.main.config.betTime + shakingDuration;

        if (this.main.currentTimeRemaining > shakeTimePoint) {
            this.main.setGameRound(this.main.roundId - 1);

            if (!this.main.resultAnimating) {
                this.main.showResult();
            }

            const time = numberPad(this.main.currentTimeRemaining - this.main.config.betTime - shakingDuration - 1, 2);
            if (this.main.timeWaitNode) {
                this.main.timeWaitNode.active = true;
            }
            this.main.timeWaitLabel.string = `${numberPad(time, 2)}`;
        } else {
            if (this.main.timeWaitNode) {
                this.main.timeWaitNode.active = false;
            }
            this.main.setGameRound(this.main.roundId);

            if (this.main.currentTimeRemaining === shakeTimePoint) {
                this.main.dishNode.active = true;
                this.main.dishNode.runAction(
                    cc.sequence(
                        cc.moveTo(0.3, this.main.originalDishPosition),
                        cc.callFunc(() => {
                            this.main.animation.play();
                            this.handleStartingNewGameRound();
                        })
                    )
                );
            }
        }
    }

    handleStartingNewGameRound() {
        super.handleStartingNewGameRound();
        this.main.highlightLastResult();
        this.main.animation.node.active = true;
    }

    handleInRoundTime() {
        super.handleInRoundTime();
        this.main.animation.node.active = true;
        this.main.betItems.forEach((item) => item.resetHighlight());
        this.main.dishNode.position = cc.v3(this.main.originalDishPosition);
        this.main.dishNode.active = true;
    }
}
