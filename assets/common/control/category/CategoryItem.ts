const { ccclass, property } = cc._decorator;

@ccclass
export default class CategoryItem extends cc.Component {
    onCategoryClickCallback: () => void;
    private _itemId: number;

    get itemId() {
        return this._itemId;
    }

    set itemId(value: number) {
        this._itemId = value;
        this.updateForItemId();
    }

    onClickCategory() {
        cc.GameManager.playClick();
        this.onCategoryClickCallback();
    }

    updateForItemId() {}

    showLeftSeperator() {
        this.node.getChildByName("line").active = true;
    }
}
