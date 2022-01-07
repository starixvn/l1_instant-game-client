const { ccclass, property } = cc._decorator;

var ResizeMode = cc.Enum({
    NONE: 0,
    CONTAINER: 1,
    CHILDREN: 2
});

var Type = cc.Enum({
    NONE: 0,
    HORIZONTAL: 1,
    VERTICAL: 2,
    GRID: 3
});

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
