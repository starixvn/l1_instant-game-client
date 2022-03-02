import configs = require("../../configs/Configs");

const { ccclass, property } = cc._decorator;

@ccclass
export default class AutoSiteNote extends cc.Component {
    onLoad() {
        const site = configs.systemType.toLowerCase();
        this.node.children.forEach((child) => {
            child.active = site === child.name;
        });
    }
}
