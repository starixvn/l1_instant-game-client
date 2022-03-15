const { ccclass, property } = cc._decorator;

@ccclass
export default class MinWidthLayout extends cc.Component {
    @property
    padding = 8;

    @property()
    minWidth = 0;

    @property(cc.Node)
    target: cc.Node = null;

    onLoad() {
        this.onTargetSizeChanged();
        this.target.on(cc.Node.EventType.SIZE_CHANGED, this.onTargetSizeChanged.bind(this), this);
    }

    onTargetSizeChanged() {
        this.node.width = Math.max(this.minWidth, this.target.width + this.padding * 2);
    }
}
