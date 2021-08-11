import BaseComponent from "../../../common/control/BaseComponent";
import CommonDialog from "../../../common/control/CommonDialog";
import GameBase from "../../_base/GameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BigSmallRoundHistory extends BaseComponent {
    @property(CommonDialog)
    dialog: CommonDialog = null;

    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property(cc.Label)
    bigLabel: cc.Label = null;

    @property(cc.Label)
    smallLabel: cc.Label = null;

    protected suffix = "%";

    onLoad() {
        this.dialog.onDidHide = () => {
            this.node.destroy();
        };
    }

    public setData(data: any) {
        this.updateHistory(data);
    }

    public init(main: GameBase) {
        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };
        this.logControl.init(condition);
    }

    private updateHistory(bigSmallData: any) {
        const data = [...bigSmallData];
        this.updateStatistic(data);
        data.reverse();
        this.logControl.setData(data);
    }

    private updateStatistic(bigSmallData: number[]) {
        const total = bigSmallData.length;

        if (total === 0) {
            this.updateStatisticLabels(0, 0);
            return;
        }
        const bigValue = bigSmallData.filter((value) => value > 0).length;
        const smallValue = total - bigValue;

        if (bigValue > smallValue) {
            const smallPercent = Math.floor((smallValue * 100) / total);
            this.updateStatisticLabels(100 - smallPercent, smallPercent);
        } else {
            const bigPercent = Math.floor((smallValue * 100) / total);
            this.updateStatisticLabels(bigPercent, 100 - bigPercent);
        }
    }

    protected updateStatisticLabels(big, small) {
        this.smallLabel.string = `${big}${this.suffix}`;
        this.bigLabel.string = `${small}${this.suffix}`;
    }
}
