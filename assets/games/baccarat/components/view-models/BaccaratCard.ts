import NewCard from "../../../../common/control/new-card/view-models/NewCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaccaratCard extends NewCard {
    @property(cc.Node)
    index: cc.Label = null;

    setLargeSuiteImage(lowerCaseRank: string) {
        if (+this.card.rank || this.card.rank === "A") {
            this.largeSuite.spriteFrame = this.atlas.getSpriteFrame(this.suffix[this.card.suit]);
            this.largeSuite.node.width = 62;
            this.largeSuite.node.height = 68;
        } else {
            this.largeSuite.spriteFrame = this.atlas.getSpriteFrame(this.picture[lowerCaseRank]);
            this.largeSuite.node.width = 86;
            this.largeSuite.node.height = 130;
        }
    }

    setNumberTag(data: string) {
        this.index.getComponent(cc.Label).string = data;
    }

    getNumberTag() {
        return this.index.getComponent(cc.Label).string;
    }
}
