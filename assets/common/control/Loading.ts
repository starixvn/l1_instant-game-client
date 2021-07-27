const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends cc.Component {
    @property(cc.Label)
    percent: cc.Label = null;

    onEnable() {
        this.percent.node.active = true;
    }
    onDisable() {
        this.percent.string = "";
    }

    setDefaultPercent() {
        this.percent.string = "0%";
    }

    onData(data: any) {
        if (data.active) {
            this.node.active = data.active;
        }
        if (data.text) {
            this.percent.string = data.text;
        }
    }

    onProgress(completedCount, totalCount, item) {
        const percent = (100 * completedCount) / totalCount;
        if (this.node) {
            this.node.active = true;
        }

        if (this.percent && percent) {
            this.percent.node.active = true;
            this.percent.string = `${percent.toFixed(0)}%`;
        }
    }
}
