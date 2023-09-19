import CategoryItem from "./CategoryItem";
import * as i18n from "i18n/runtime-scripts/LanguageData";
import { isMicrositeGame } from "../../../configs/GameConfigurations";
import GameUtils from "../../utils/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCategoryItem extends CategoryItem {
    @property(cc.Label)
    lblGameName: cc.Label = null;

    updateForItemId() {
        if (isMicrositeGame(+this.itemId)) {
            GameUtils.getRemoteDisplayGameName(this.itemId).then((name) => (this.lblGameName.string = name.toUpperCase()));
        } else {
            this.lblGameName.string = i18n.t(`gameNames.${this.itemId}`).toUpperCase();
        }
    }
}
