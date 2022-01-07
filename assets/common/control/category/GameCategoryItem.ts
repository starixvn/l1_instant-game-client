import LocalizedLabelWithFormat from "../i18n/LocalizedLabelWithFormat";
import CategoryItem from "./CategoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCategoryItem extends CategoryItem {
    @property(LocalizedLabelWithFormat)
    label: LocalizedLabelWithFormat = null;

    updateForItemId() {
        this.label.dataId = `gameNames.${this.itemId}`;
    }
}
