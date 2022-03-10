const { ccclass, property } = cc._decorator;

export enum TipAlignment {
    Left,
    Cennter,
    Right
}

@ccclass
export default abstract class MiniRoundHistoryTip extends cc.Component {
    @property(cc.Node)
    background: cc.Node = null;

    @property(cc.Label)
    result: cc.Label = null;

    @property(cc.Label)
    roundId: cc.Label = null;

    @property()
    offsetAligment = 0.2;

    public abstract setData(data: any);

    public show(show = true) {
        this.node.active = show;
    }

    public setAlignment(alignment: TipAlignment) {
        const pos = this.background.position;
        const width = this.background.width;
        const dict = [-0.5 + this.offsetAligment, 0, 0.5 - this.offsetAligment];
        const posX = width * dict[alignment];
        this.background.position = cc.v3(posX, pos.y, pos.z);
    }
}
