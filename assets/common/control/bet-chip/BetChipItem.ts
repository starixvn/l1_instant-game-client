const { ccclass, property } = cc._decorator;

@ccclass
export default class BetChipItem extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Node)
    highlight: cc.Node = null;
}
