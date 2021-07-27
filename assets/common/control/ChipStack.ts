const { ccclass, property } = cc._decorator;

@ccclass
export default class ChipStack extends cc.Component {
    public chipSize = 20;
    public thickness = 3;
    public skewX = 0;
    public ratioPosX = 1.5;

    onLoad() {
        this.node.anchorY = 0;
    }

    addChip(chipNode: cc.Node) {
        chipNode.position = cc.v3(this.calcPositionX(), this.getCurrentHeight());
        this.node.addChild(chipNode);
    }

    getCurrentHeight(): number {
        return this.node.childrenCount * this.thickness;
    }

    calcPositionX() {
        if (this.skewX === 0) {
            return 0;
        }

        let positionX = 0;

        if (this.skewX > 0) {
            positionX = -this.node.childrenCount * this.ratioPosX;
        }

        if (this.skewX < 0) {
            positionX = this.node.childrenCount * this.ratioPosX;
        }

        return positionX;
    }
}
