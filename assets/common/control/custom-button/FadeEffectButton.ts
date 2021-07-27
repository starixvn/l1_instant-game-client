import NewButton from "./NewButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FadeEffectButton extends cc.Component {
    private isSelected: boolean = undefined;

    setActive(status = true) {
        if (this.isSelected === status) {
            return;
        }

        this.isSelected = status;
        this.node.stopAllActions();

        if (status) {
            this.node.active = status;
            this.node.getComponent(NewButton).collider.getComponent(cc.PolygonCollider).enabled = true;
            this.node.opacity = 0;

            cc.tween(this.node).to(0.2, { opacity: 255 }, { easing: "sineOut" }).start();
        } else {
            this.node.opacity = 255;
            this.node.getComponent(NewButton).collider.getComponent(cc.PolygonCollider).enabled = false;
            cc.tween(this.node)
                .to(0.2, { opacity: 0 }, { easing: "sineOut" })
                .call(() => {
                    this.node.active = status;
                })
                .start();
        }
    }
}
