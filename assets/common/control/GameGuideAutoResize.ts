import { FeatureConfig } from "../../configs/FeatureConfigs";
import AutoSiblingResize from "./AutoSiblingResize";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameGuideAutoResize extends AutoSiblingResize {
    @property
    portraiRatioWidth = 0.9;

    @property
    portraiRatioHeight = 0.75;

    setWidth() {
        if (this.syncWidth) {
            if (FeatureConfig.PortraitMode) {
                this.node.width = this.target.width * this.portraiRatioWidth;
            } else {
                this.node.width = this.target.width * this.ratioWidth;
            }
        }
    }

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
