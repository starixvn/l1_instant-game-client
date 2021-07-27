import BounceInEffect from "./BounceInEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonDialog extends BounceInEffect {
	@property({ override: true })
	time = 0.4;

	onDidHide = () => { };
	onWillShow = () => { };

	closeDialog(enableSound = true) {
		this.node.runAction(cc.sequence(
			cc.spawn(cc.scaleTo(this.time, 0).easing(cc.easeBackIn()),
				cc.fadeTo(this.time, 0)),
			cc.callFunc(() => {
				this.node.active = false;
				this.onDidHide();
			})));

		enableSound && cc.RedT.audio.playUnClick();
	}

	showDialog() {
		this.onWillShow();
		this.node.active = true;
	}
}
