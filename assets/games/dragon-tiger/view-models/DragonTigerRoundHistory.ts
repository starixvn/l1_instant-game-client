import BaseComponent from "../../../common/control/BaseComponent";
import CommonDialog from "../../../common/control/CommonDialog";
import GameBase from "../../_base/GameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import DragonTiger from "./DragonTiger";
import DragonTigerRoundResultItem from "./DragonTigerRoundResultItem";

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
        // data.reverse();
        // const settlementResult = data.map((log) => {
        //     return this.mainGame.getWinItem(log.settlementResult);
        // });
        // this.logControl.setData(settlementResult);
    }

    private updateStatistic(dragonTigerData) {
        const total = dragonTigerData.length;

        if (total === 0) {
            this.updateStatisticLabels(0, 0, 0);
            return;
        }

        let dragonCount = 0,
            drawCount = 0;
        const logControlData = [];
        const result = [];

        dragonTigerData.forEach((log) => {
            const settlementResult = log.settlementResult;
            const winItem = this.mainGame.getWinItem(settlementResult);
            result.push(winItem);

            switch (winItem) {
                case 0:
                    dragonCount++;
                    break;
                case 2:
                    drawCount++;
                    break;
            }
        });

        let count = 0;
        for (let i = 0; i < result.length; ) {
            if (result[i] === 2) {
                //draw
                count++;
                if (i === result.length - 1) {
                    // show special last item
                    logControlData.push({ item: 2, draw: count });
                }
            } else {
                logControlData.push({
                    item: result[i],
                    draw: count
                });
                count = 0;
            }
            i++;
        }
        logControlData.reverse();
        this.logControl.setData(logControlData.map((d) => d.item));
        const items = this.logControl.content.getComponentsInChildren(DragonTigerRoundResultItem);
        items.forEach((item, index) => item.setValue(logControlData[index].draw));

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
