import PromotionNotificationsHandler, { PromotionNotification, PromotionNotificationsEvent } from "./PromotionNotificationsHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionNotifications extends cc.Component {
    @property(cc.Node)
    icon: cc.Node = null;

    @property(cc.Label)
    countNode: cc.Label = null;

    @property(cc.Prefab)
    announcementPrefab: cc.Prefab = null;

    @property(cc.Node)
    announcementContainer: cc.Node = null;

    start(): void {
        PromotionNotificationsHandler.getInstance().on(PromotionNotificationsEvent.NEW_PROMOTION, (data) => {
            this.showNotification(data);
        });
    }

    onDestroy() {
        PromotionNotificationsHandler.getInstance().removeAllListeners();
    }

    showNotification(data: PromotionNotification[]) {
        this.icon.active = false;
        console.log(data.length);
        if (data.length > 0) {
            this.countNode.string = data.length.toString();
            this.icon.active = true;
        }
    }

    onClickNotification() {
        const node = cc.instantiate(this.announcementPrefab);
        this.announcementContainer.addChild(node);
    }
}
