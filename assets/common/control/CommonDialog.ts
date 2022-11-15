import BounceInEffect from "./BounceInEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonDialog extends BounceInEffect {
    @property({ override: true })
    time = 0.4;

    onWillShow = () => {};
    private readonly onDidHideActions = [];

    closeDialog(enableSound = true) {
        this.node.runAction(
            cc.sequence(
                cc.spawn(cc.scaleTo(this.time, 0).easing(cc.easeBackIn()), cc.fadeTo(this.time, 0)),
                cc.callFunc(() => {
                    this.node.active = false;
                    this.onDidHide();
                })
            )
        );

        enableSound && cc.GameManager.playUnClick();
    }

    showDialog() {
        this.onWillShow();
        this.node.active = true;
    }

    addOnDidHide(action: () => void) {
        this.onDidHideActions.push(action);
    }

    private onDidHide() {
        this.onDidHideActions.forEach((action) => action());
    }
}
