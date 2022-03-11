import NewCard from "../../../../common/control/new-card/view-models/NewCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoCard extends NewCard {
    @property(cc.Node)
    highlight: cc.Node = null;

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
}
