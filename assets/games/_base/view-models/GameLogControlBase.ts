import BlinkNode from "../../../common/control/BlinkNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameLogControlBase extends cc.Component {
    @property({ type: cc.Node })
    items: cc.Node[] = [];

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Node)
    itemNext: cc.Node = null;

    @property({ type: cc.Integer })
    RowMax = 6;

    @property(cc.Size)
    itemSize: cc.Size = new cc.Size(22, 22);

    @property(cc.Size)
    padding: cc.Size = new cc.Size(2, 2);

    protected nextMark: cc.Node = null;
    protected dots: cc.Node[] = [];
    protected checkShowNext = () => false;

    init(condition: () => boolean) {
        this.checkShowNext = condition;
    }

    public setData(results: number[]) {
        this.dots.forEach((dot) => {
            dot.removeFromParent();
            dot.destroy();
        });
        this.dots = [];

        let col = 0,
            row = 0;
        let maxX = 0;
        let nextCol = 1;
        let previousResult = undefined;
        const rowMax = {};
        let colMax = 0;
        const start = cc.v2(-this.itemSize.width / 2, -this.itemSize.height / 2 - this.padding.height);
        results.forEach((result, i) => {
            if (result === previousResult) {
                const max = rowMax.hasOwnProperty(col) ? rowMax[col] : this.RowMax;
                if (row < max - 1) {
                    row++;
                } else if (row === 0 && max === 1) {
                    col = nextCol;
                    nextCol++;
                } else {
                    col++;
                    rowMax[col] = row;
                }
            } else {
                row = 0;
                col = nextCol;
                nextCol++;
            }

            if (col > colMax) {
                colMax = col;
            }

            previousResult = result;

            const dot = cc.instantiate(this.items[result]);
            maxX = this.handleDotAction(dot, start, col, row, maxX);
        });

        this.addNextMark(rowMax, row, col, nextCol, start);
        this.updateContentPosition(maxX);
    }

    protected handleDotAction(dot: any, start: any, col: number, row: number, maxX: number) {
        dot.active = true;
        dot.position = cc.v2(start.x + col * this.itemSize.width, start.y - row * this.itemSize.height);
        maxX = Math.max(maxX, dot.position.x);
        this.content.addChild(dot);
        this.dots.push(dot);

        return maxX;
    }

    protected updateContentPosition(maxX: number) {
        maxX = Math.max(maxX, this.nextMark.position.x);
        this.content.width = Math.max(maxX + this.itemSize.width / 2, this.node.width) + 2 * this.padding.width;

        this.content.position = cc.v3(-this.content.width, this.content.position.y);
    }

    protected addNextMark(rowMax, row, col, nextCol, start) {
        const max = rowMax.hasOwnProperty(col) ? rowMax[col] : this.RowMax;
        if (row < max - 1) {
            row++;
        } else {
            row = 0;
            col = nextCol;
        }
        const dot = cc.instantiate(this.itemNext);
        dot.active = false;
        dot.position = cc.v3(start.x + col * this.itemSize.width, start.y - row * this.itemSize.height);
        dot.addComponent(BlinkNode).interval = 0.5;
        this.content.addChild(dot);
        this.nextMark = dot;
        this.dots.push(dot);
    }

    update() {
        if (this.nextMark && this.nextMark.isValid) {
            this.nextMark.active = this.checkShowNext();
        }
    }
}
