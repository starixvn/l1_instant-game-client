const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomDisplayToggle extends cc.Toggle {
    @property(cc.Node)
    disabledDisplayNode: cc.Node = null;

    @property(cc.Node)
    unCheckImage: cc.Node = null;

    _updateCheckMark() {
        super._updateCheckMark();

        if (this.unCheckImage) {
            this.unCheckImage.active = !this.isChecked;
        }
    }

    _updateState() {
        super._updateState();
        this.disabledDisplayNode.active = !this.interactable;
    }
}
