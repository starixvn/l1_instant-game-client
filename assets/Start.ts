import { FeatureConfig } from "./configs/FeatureConfigs";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Start extends cc.Component {
    onLoad() {
        if (FeatureConfig.PortraitMode) {
            cc.director.loadScene("Main_Portrait");
        } else {
            cc.director.loadScene("Main");
        }
    }
}
