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
export default class MinWidthLayout extends cc.Layout {
    @property()
    minWidth = 0;

    _doLayout() {
        if (this.type === Type.HORIZONTAL) {
            var newWidth = this._getHorizontalBaseWidth(this.node.children);

            var fnPositionY = function (child) {
                return child.y;
            };

            this._doLayoutHorizontally(newWidth, false, fnPositionY, true);

            this.node.width = Math.max(newWidth, this.minWidth);
        } else if (this.type === Type.VERTICAL) {
            var newHeight = this._getVerticalBaseHeight(this.node.children);

            var fnPositionX = function (child) {
                return child.x;
            };

            this._doLayoutVertically(newHeight, false, fnPositionX, true);

            this.node.height = newHeight;
        } else if (this.type === Type.NONE) {
            if (this.resizeMode === ResizeMode.CONTAINER) {
                this._doLayoutBasic();
            }
        } else if (this.type === Type.GRID) {
            this._doLayoutGrid();
        }
    }
}
