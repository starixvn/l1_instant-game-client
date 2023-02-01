import GameUtils from "../utils/GameUtils";
import { AutoScaleWidget } from "./AutoScaleWidget";

const { ccclass } = cc._decorator;

@ccclass
export default class IpadAutoScaleWidget extends AutoScaleWidget {
    isIpad(): boolean {
        return GameUtils.isIpad();
    }

    protected updateDisplay(): void {
        if (!this.isIpad()) {
            return;
        }
        super.updateDisplay();
    }
}
