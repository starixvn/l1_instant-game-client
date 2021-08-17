import BaseComponent from "../../../common/control/BaseComponent";
import CommonDialog from "../../../common/control/CommonDialog";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import DragonTiger from "./DragonTiger";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragonTigerRoundHistory extends BaseComponent {
    @property(CommonDialog)
    dialog: CommonDialog = null;

    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property(cc.Label)
    dragonLabel: cc.Label = null;

    @property(cc.Label)
    tigerLabel: cc.Label = null;

    @property(cc.Label)
    tieLabel: cc.Label = null;

    protected suffix = "%";
    public mainGame: DragonTiger;

    onLoad() {
        this.dialog.onDidHide = () => {
            this.node.destroy();
        };
    }

    public setData(data: any) {
        this.updateHistory(data);
    }

    public init(main: DragonTiger) {
        this.mainGame = main;

        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };
        this.logControl.init(condition);
    }

    private updateHistory(dragonTigerData: any) {
        const data = [...dragonTigerData];
        this.updateStatistic(data);
        data.reverse();
        this.logControl.setData(data);
    }

    private updateStatistic(dragonTigerData) {
        const total = dragonTigerData.length;

        if (total === 0) {
            this.updateStatisticLabels(0, 0, 0);
            return;
        }

        let dragonCount = 0,
            drawCount = 0;

        dragonTigerData.forEach((log) => {
            switch (log) {
                case 0:
                    dragonCount++;
                    break;
                case 2:
                    drawCount++;
                    break;
            }
        });

        const dragonStats = Math.floor((dragonCount * 100) / total);
        const drawStats = Math.floor((drawCount * 100) / total);
        const tigerStats = 100 - (dragonStats + drawStats);

        this.updateStatisticLabels(dragonStats, tigerStats, drawStats);
    }

    protected updateStatisticLabels(dragon, tiger, tie) {
        this.dragonLabel.string = `${dragon}${this.suffix}`;
        this.tigerLabel.string = `${tiger}${this.suffix}`;
        this.tieLabel.string = `${tie}${this.suffix}`;
    }
}
