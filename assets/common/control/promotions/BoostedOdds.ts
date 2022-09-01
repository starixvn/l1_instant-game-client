const { ccclass, property } = cc._decorator;

export const BoostedOddsEvent = {
    SHOW_PROMOTION_ANNOUNCEMENT: "SHOW_PROMOTION_ANNOUNCEMENT"
};
@ccclass
export default class BoostedOdds extends cc.Component {
    @property(cc.Node)
    icon: cc.Node = null;

    handleBoostedOdds() {
        cc.tween(this.icon)
            .call(() => (this.icon.active = true))
            .delay(15)
            .call(() => (this.icon.active = false))
            .start();
    }

    onDisable() {
        this.node.stopAllActions();
    }

    onClickBoostedOdds() {
        this.node.emit(BoostedOddsEvent.SHOW_PROMOTION_ANNOUNCEMENT);
    }
}
