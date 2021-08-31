const { ccclass, property } = cc._decorator;

var ResizeMode = cc.Enum({
    NONE: 0,
    CONTAINER: 1,
    CHILDREN: 2
});

var HorizontalDirection = cc.Enum({
    LEFT_TO_RIGHT: 0,
    RIGHT_TO_LEFT: 1
});

var VerticalDirection = cc.Enum({
    BOTTOM_TO_TOP: 0,
    TOP_TO_BOTTOM: 1
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

    _getHorizontalBaseWidth(children) {
        var newWidth = 0;
        var activeChildCount = 0;
        if (this.resizeMode === ResizeMode.CONTAINER) {
            for (var i = 0; i < children.length; ++i) {
                var child = children[i];
                if (child.activeInHierarchy) {
                    activeChildCount++;
                    newWidth += child.width * this._getUsedScaleValue(child.scaleX);
                }
            }
            newWidth += (activeChildCount - 1) * this.spacingX + this.paddingLeft + this.paddingRight;
        } else {
            newWidth = this.node.getContentSize().width;
        }

        return Math.max(newWidth, this.minWidth);
    }

    _doLayoutHorizontally(baseWidth, rowBreak, fnPositionY, applyChildren) {
        var layoutAnchor = this.node.getAnchorPoint();
        var children = this.node.children;

        var sign = 1;
        var paddingX = this.paddingLeft;
        var leftBoundaryOfLayout = -layoutAnchor.x * Math.max(baseWidth, this.minWidth);
        if (this.horizontalDirection === HorizontalDirection.RIGHT_TO_LEFT) {
            sign = -1;
            leftBoundaryOfLayout = (1 - layoutAnchor.x) * Math.max(baseWidth, this.minWidth);
            paddingX = this.paddingRight;
        }

        var nextX = leftBoundaryOfLayout + sign * paddingX - sign * this.spacingX;
        var rowMaxHeight = 0;
        var tempMaxHeight = 0;
        var secondMaxHeight = 0;
        var row = 0;
        var containerResizeBoundary = 0;

        var maxHeightChildAnchorY = 0;

        var activeChildCount = 0;
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            if (child.activeInHierarchy) {
                activeChildCount++;
            }
        }

        var newChildWidth = Math.max(this.cellSize.width, this.minWidth);
        if (this.type !== Type.GRID && this.resizeMode === ResizeMode.CHILDREN) {
            newChildWidth =
                (Math.max(baseWidth, this.minWidth) - (this.paddingLeft + this.paddingRight) - (activeChildCount - 1) * this.spacingX) /
                activeChildCount;
        }

        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            let childScaleX = this._getUsedScaleValue(child.scaleX);
            let childScaleY = this._getUsedScaleValue(child.scaleY);
            if (!child.activeInHierarchy) {
                continue;
            }
            //for resizing children
            if (this._resize === ResizeMode.CHILDREN) {
                child.width = newChildWidth / childScaleX;
                if (this.type === Type.GRID) {
                    child.height = this.cellSize.height / childScaleY;
                }
            }

            var anchorX = child.anchorX;
            var childBoundingBoxWidth = Math.max(child.width, this.minWidth) * childScaleX;
            var childBoundingBoxHeight = child.height * childScaleY;

            if (secondMaxHeight > tempMaxHeight) {
                tempMaxHeight = secondMaxHeight;
            }

            if (childBoundingBoxHeight >= tempMaxHeight) {
                secondMaxHeight = tempMaxHeight;
                tempMaxHeight = childBoundingBoxHeight;
                maxHeightChildAnchorY = child.getAnchorPoint().y;
            }

            if (this.horizontalDirection === HorizontalDirection.RIGHT_TO_LEFT) {
                anchorX = 1 - child.anchorX;
            }
            nextX = nextX + sign * anchorX * childBoundingBoxWidth + sign * this.spacingX;
            var rightBoundaryOfChild = sign * (1 - anchorX) * childBoundingBoxWidth;

            if (rowBreak) {
                var rowBreakBoundary = nextX + rightBoundaryOfChild + sign * (sign > 0 ? this.paddingRight : this.paddingLeft);
                var leftToRightRowBreak =
                    this.horizontalDirection === HorizontalDirection.LEFT_TO_RIGHT &&
                    rowBreakBoundary > (1 - layoutAnchor.x) * Math.max(baseWidth, this.minWidth);
                var rightToLeftRowBreak =
                    this.horizontalDirection === HorizontalDirection.RIGHT_TO_LEFT &&
                    rowBreakBoundary < -layoutAnchor.x * Math.max(baseWidth, this.minWidth);

                if (leftToRightRowBreak || rightToLeftRowBreak) {
                    if (childBoundingBoxHeight >= tempMaxHeight) {
                        if (secondMaxHeight === 0) {
                            secondMaxHeight = tempMaxHeight;
                        }
                        rowMaxHeight += secondMaxHeight;
                        secondMaxHeight = tempMaxHeight;
                    } else {
                        rowMaxHeight += tempMaxHeight;
                        secondMaxHeight = childBoundingBoxHeight;
                        tempMaxHeight = 0;
                    }
                    nextX = leftBoundaryOfLayout + sign * (paddingX + anchorX * childBoundingBoxWidth);
                    row++;
                }
            }

            var finalPositionY = fnPositionY(child, rowMaxHeight, row);
            if (Math.max(baseWidth, this.minWidth) >= childBoundingBoxWidth + this.paddingLeft + this.paddingRight) {
                if (applyChildren) {
                    child.setPosition(cc.v2(nextX, finalPositionY));
                }
            }

            var signX = 1;
            var tempFinalPositionY;
            var topMarign = tempMaxHeight === 0 ? childBoundingBoxHeight : tempMaxHeight;

            if (this.verticalDirection === VerticalDirection.TOP_TO_BOTTOM) {
                containerResizeBoundary = containerResizeBoundary || this.node._contentSize.height;
                signX = -1;
                tempFinalPositionY = finalPositionY + signX * (topMarign * maxHeightChildAnchorY + this.paddingBottom);
                if (tempFinalPositionY < containerResizeBoundary) {
                    containerResizeBoundary = tempFinalPositionY;
                }
            } else {
                containerResizeBoundary = containerResizeBoundary || -this.node._contentSize.height;
                tempFinalPositionY = finalPositionY + signX * (topMarign * maxHeightChildAnchorY + this.paddingTop);
                if (tempFinalPositionY > containerResizeBoundary) {
                    containerResizeBoundary = tempFinalPositionY;
                }
            }

            nextX += rightBoundaryOfChild;
        }

        return containerResizeBoundary;
    }
}
