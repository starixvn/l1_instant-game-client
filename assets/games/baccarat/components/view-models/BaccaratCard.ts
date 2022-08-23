import NewCard from "../../../../common/control/new-card/view-models/NewCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratCard extends NewCard {
    @property(cc.Label)
    index: cc.Label = null;

    @property(cc.Node)
    highLight: cc.Node = null;

    setNumberTag(number: string) {
        this.index.string = number;
    }

    getNumberTag() {
        return this.index.string;
    }

    setHighlight() {
        this.highLight.active = true;
    }

    resetHighlight() {
        this.highLight.active = false;
    }

    setStatusInfoIndex(status: boolean) {
        this.index.node.parent.active = status;
    }
}
