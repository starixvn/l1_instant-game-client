const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoSiblingResize extends cc.Component {
    @property(cc.Node)
    target: cc.Node = null;

    @property
    syncWidth = true;

    @property
    syncHeight = true;

    onLoad() {
        this.target.on(cc.Node.EventType.SIZE_CHANGED, this.resizeNode, this);
        this.resizeNode();
    }

    onDestroy() {
        this.target.off(cc.Node.EventType.SIZE_CHANGED, this.resizeNode, this);
    }

    resizeNode() {
        if (this.syncWidth) {
            this.node.width = this.target.width;
        }
        if (this.syncHeight) {
            this.node.height = this.target.height;
        }

        const richText = this.getComponent(cc.RichText);
        if (richText) {
            richText.maxWidth = this.node.width;
        }

        this.node.children.forEach((child) => {
            const widget = child.getComponent(cc.Widget);
            if (widget) {
                widget.updateAlignment();
            }
        });
    }
}
