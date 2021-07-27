const { ccclass, property } = cc._decorator;

@ccclass
export default class SedieHistoryItemBase extends cc.Component {
    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    phien: cc.Label = null;

    @property(cc.Sprite)
    kqSprite: cc.Sprite = null;

    @property(cc.Label)
    kqLabel: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;
}
