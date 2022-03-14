import { FeatureConfig } from "../../configs/FeatureConfigs";
import AutoSiblingResize from "./AutoSiblingResize";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameGuideAutoResize extends AutoSiblingResize {
    @property
    portraiRatioHeight = 0.75;

    update(dt) {}

    setHeight() {
        if (this.syncHeight) {
            if (FeatureConfig.PortraitMode) {
                this.node.height = this.target.height * this.portraiRatioHeight;
            } else {
                this.node.height = this.target.height * this.ratioHeight;
            }
        }
    }
}
