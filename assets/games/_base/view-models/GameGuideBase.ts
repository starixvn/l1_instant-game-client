const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class GameGuideBase extends cc.Component {
    @property({ type: cc.Component })
    textComponents: cc.Component[] = [];

    @property(cc.Node)
    mainFrame: cc.Node = null;

    gameConfigs: any;

    onLoad() {
        const commonDialog = this.mainFrame.getComponent("CommonDialog");
        commonDialog.onDidHide = () => {
            this.node.destroy();
        };
    }

    init(configs) {
        this.gameConfigs = configs;
        const replaceData = this.createReplaceData(configs);

        this.textComponents.forEach((label: any) => {
            Object.keys(replaceData).forEach((key) => {
                const reg = new RegExp(key, "g");
                label.string = label.string.replace(reg, replaceData[key]);
            });
        });
    }

    abstract createReplaceData(configs): {};

    getMaxBet(): number {
        return Math.min(this.gameConfigs.maxBet, cc.GameManager.userStakeLevel.maxBet);
    }

    getMinBet(): number {
        return Math.max(this.gameConfigs.minBet, cc.GameManager.userStakeLevel.minBet);
    }

    getMaxBetForChoice(choiceMaxBet: number): number {
        return Math.min(this.getMaxBet(), choiceMaxBet);
    }
}
