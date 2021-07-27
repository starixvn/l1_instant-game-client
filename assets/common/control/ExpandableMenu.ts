const { ccclass, property } = cc._decorator;

@ccclass
export default class ExpandableMenu extends cc.Component {
    @property(cc.Node)
    expandableNode: cc.Node = null;

    @property
    defaultExpand = false;

    @property(cc.Node)
    blockInputNode: cc.Node = null;

    private expanded = false;

    onLoad() {
        if (this.defaultExpand) {
            this.expandMenu();
        } else {
            this.collapseMenu(false);
        }
    }

    collapseMenu(animated = true) {
        this.expanded = false;

        if (this.blockInputNode) {
            this.blockInputNode.active = false;
        }

        if (!animated) {
            this.expandableNode.opacity = 0;
            this.expandableNode.scaleY = 0;
            return;
        }
        this.expandableNode.stopAllActions();
        cc.tween(this.expandableNode).to(0.2, { opacity: 0, scaleY: 0 }).start();
    }

    expandMenu() {
        this.expanded = true;
        if (this.blockInputNode) {
            this.blockInputNode.active = true;
        }
        this.expandableNode.stopAllActions();
        cc.tween(this.expandableNode).to(0.2, { opacity: 255, scale: 1 }).start();
    }

    onMenuClick() {
        cc.RedT.audio.playClick();
        this.expanded = !this.expanded;
        this.expanded ? this.expandMenu() : this.collapseMenu();
    }
}
