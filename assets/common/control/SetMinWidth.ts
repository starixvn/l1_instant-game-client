import * as i18n from "i18n/runtime-scripts/LanguageData";
const { ccclass, property } = cc._decorator;

@ccclass
export default class SetMinWidth extends cc.Component {
    @property(cc.Node)
    containerLayout: cc.Node = null;

    @property()
    minWidth = 0;

    onLoad() {
        const layout = this.containerLayout.getComponent(cc.Layout);
        cc.tween(this)
            .delay(0.2)
            .call(() => {
                this.containerLayout.children.forEach((item) => {
                    layout.enabled = false;

                    if (item.width < this.minWidth && item.width > 3) {
                        item.getComponent(cc.Layout).enabled = false;
                        item.width = this.minWidth;
                    }
                });
                layout.enabled = true;
                layout.updateLayout();
            })
            .start();
    }
}
