import GameRoundHistory from "../../_base/view-models/GameRoundHistory";
import SicBoRoundHistoryItem from "./SicBoRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SicBoRoundHistory extends GameRoundHistory {
    @property(cc.Prefab)
    roundHistoryItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    contentLogs: cc.Node = null;

    @property(cc.SpriteFrame)
    diceSpriteFrames: cc.SpriteFrame[] = [];

    protected suffix = "";

    updateStatistic(roundHistoryData) {
        const total = roundHistoryData.length;

        if (total === 0) {
            return;
        }

        this.updateRoundResult(roundHistoryData);
        this.updatePercentages(roundHistoryData);
    }

    updatePercentages(dataLogs: any[]) {
        if (dataLogs.length > 0) {
            let dice1Total = 0,
                dice2Total = 0,
                dice3Total = 0,
                dice4Total = 0,
                dice5Total = 0;

            dataLogs.forEach((log) => {
                dice1Total += this.countDiceValue(log.result, 1);
                dice2Total += this.countDiceValue(log.result, 2);
                dice3Total += this.countDiceValue(log.result, 3);
                dice4Total += this.countDiceValue(log.result, 4);
                dice5Total += this.countDiceValue(log.result, 5);
            });

            const length = dataLogs.length;

            const dice1Percentage = Math.round((dice1Total / (length * 3)) * 100);
            const dice2Percentage = Math.round((dice2Total / (length * 3)) * 100);
            const dice3Percentage = Math.round((dice3Total / (length * 3)) * 100);
            const dice4Percentage = Math.round((dice4Total / (length * 3)) * 100);
            const dice5Percentage = Math.round((dice5Total / (length * 3)) * 100);
            const dice6Percentage = 100 - (dice1Percentage + dice2Percentage + dice3Percentage + dice4Percentage + dice5Percentage);

            this.statisticLabels[0].string = `${dice1Percentage}%`;
            this.statisticLabels[1].string = `${dice2Percentage}%`;
            this.statisticLabels[2].string = `${dice3Percentage}%`;
            this.statisticLabels[3].string = `${dice4Percentage}%`;
            this.statisticLabels[4].string = `${dice5Percentage}%`;
            this.statisticLabels[5].string = `${dice6Percentage}%`;
        }
    }

    countDiceValue(result: any, value: number) {
        let count = 0;
        if (result.dice1 === value) {
            count++;
        }
        if (result.dice2 === value) {
            count++;
        }
        if (result.dice3 === value) {
            count++;
        }

        return count;
    }

    updateRoundResult(dataLogs: any[]) {
        this.contentLogs.removeAllChildren();

        for (let i = 0; i < dataLogs.length; i++) {
            const dataLog = dataLogs[i];
            const { result } = dataLog;
            const roundResultNode = cc.instantiate(this.roundHistoryItemPrefab);
            const roundResultComponent = roundResultNode.getComponent(SicBoRoundHistoryItem);
            roundResultComponent.updateLabels(dataLog);
            roundResultComponent.dice1.spriteFrame = this.diceSpriteFrames[result.dice1 - 1];
            roundResultComponent.dice2.spriteFrame = this.diceSpriteFrames[result.dice2 - 1];
            roundResultComponent.dice3.spriteFrame = this.diceSpriteFrames[result.dice3 - 1];
            roundResultComponent.highlight.node.active = i === 0;
            this.contentLogs.addChild(roundResultNode);
        }
    }
}
