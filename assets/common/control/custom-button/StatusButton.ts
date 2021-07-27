const { ccclass, property } = cc._decorator;

const State = cc.Enum({
    NORMAL: 0,
    HOVER: 1,
    PRESSED: 2,
    DISABLED: 3
});

@ccclass
export default class StatusButton extends cc.Button {
    @property(cc.Node)
    disableNode: cc.Node = null;

    @property(cc.Node)
    activeNode: cc.Node = null;

    _applyTransition(state) {
        super._applyTransition(state);
        if (this.activeNode) {
            this.activeNode.active = state === State.HOVER || state === State.PRESSED;
        }
        if (this.disableNode) {
            this.disableNode.active = state === State.DISABLED;
        }
    }
}
