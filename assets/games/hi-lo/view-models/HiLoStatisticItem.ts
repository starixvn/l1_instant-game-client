import { CardModel } from "../../../common/control/new-card/view-models/NewCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoStatisticItem extends cc.Component {
    @property(cc.Sprite)
    rank: cc.Sprite = null;

    @property(cc.Sprite)
    rankOuter: cc.Sprite = null;

    @property(cc.Sprite)
    suit: cc.Sprite = null;

    @property(cc.Sprite)
    suitOuter: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    hiLoAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    cardAtlas: cc.SpriteAtlas = null;

    @property(cc.Node)
    highlight: cc.Node = null;

    suitPrefix = "statistic_suit_";
    suitSuffix = "_highlight";
    highlightRankPrefix = "statistic_highlight_";

    setData(card: CardModel) {
        const suffixsList = ["heart", "diamond", "club", "spade"];
        this.suit.spriteFrame = this.hiLoAtlas.getSpriteFrame(`${this.suitPrefix}${suffixsList[card.suit]}`);
        this.suitOuter.spriteFrame = this.hiLoAtlas.getSpriteFrame(`${this.suitPrefix}${suffixsList[card.suit]}${this.suitSuffix}`);
        this.rank.spriteFrame = this.cardAtlas.getSpriteFrame(`${card.rank.toLowerCase()}`);
        this.rankOuter.spriteFrame = this.hiLoAtlas.getSpriteFrame(`${this.highlightRankPrefix}${card.rank.toLowerCase()}`);
        if (card.suit === 0 || card.suit === 1) {
            this.rank.node.color = cc.Color.BLACK.fromHEX("#f50707");
        }
    }
}
