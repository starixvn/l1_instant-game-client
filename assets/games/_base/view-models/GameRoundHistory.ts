import BaseComponent from "../../../common/control/BaseComponent";
import CommonDialog from "../../../common/control/CommonDialog";
import GameBaseFinishHandler from "../handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import GameBase from "../../_base/GameBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameRoundHistory extends BaseComponent {
    @property(CommonDialog)
    dialog: CommonDialog = null;

    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property({ type: cc.Label })
    statisticLabels: cc.Label[] = [];

    protected suffix = "%";
    protected main: GameBase = null;

    onLoad() {
        this.dialog.onDidHide = () => {
            this.node.destroy();
        };
    }

    public setData(logs: any) {
        this.updateHistory(logs);
    }

    public init(main: GameBase) {
        this.main = main;
        const condition = () => {
            const finishHandler = this.main.finishHandler as GameBaseFinishHandler;
            return (
                this.main.currentTimeRemaining < this.main.config.stopBetTime ||
                this.main.currentTimeRemaining > this.main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };
        this.logControl && this.logControl.init(condition);
    }

    updateHistory(dataLogs: any) {
        const roundHistoryData = [...dataLogs];
        this.updateStatistic(roundHistoryData);
        roundHistoryData.reverse();
        this.logControl && this.logControl.setData(roundHistoryData);
    }

    updateStatistic(roundHistoryData) {}

    updateStatisticLabels(statisticData: any) {
        this.statisticLabels.forEach((label, index) => {
            label.string = `${statisticData[index]}${this.suffix}`;
        });
    }
}
