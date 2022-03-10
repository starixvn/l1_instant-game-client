import { CardModel } from "../../../common/control/new-card/view-models/NewCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoStatisticItem extends cc.Component {
    @property(cc.Label)
    rank: cc.Label = null;

    @property(cc.Sprite)
    suit: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    prefix = "statistic_suit_";

    setData(card: CardModel) {
        const suffixs = ["heart", "diamond", "club", "spade"];
        this.suit.spriteFrame = this.atlas.getSpriteFrame(`${this.prefix}${suffixs[card.suit]}`);
        this.rank.string = card.rank;
        const color = cc.Color.BLACK;
        if (card.suit === 0 || card.suit === 1) {
            this.rank.node.color = color.fromHEX("#f50707");
        }
    }
}
