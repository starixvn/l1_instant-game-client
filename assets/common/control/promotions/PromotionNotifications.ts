import NotificationService from "../../../manager/auth/NotificationService";

const { ccclass, property } = cc._decorator;

const PromotionNotificationsStorageKey = "PROMOTION_NOTIFICATIONS";
@ccclass
export default class PromotionNotifications extends cc.Component {
    @property(cc.Label)
    count: cc.Label = null;

    @property(cc.Prefab)
    announcementPrefab: cc.Prefab = null;

    @property(cc.Node)
    announcementContainer: cc.Node = null;

    private readonly dataKey = "promotionNotifications";

    onLoad(): void {
        NotificationService.getInstance().addDataObserver(this.dataKey, this.dataKey, this.receivedData.bind(this));
    }

    onDestroy() {
        NotificationService.getInstance().removeDataObserver(this.dataKey, this.dataKey);
    }

    receivedData(data) {
        if (data.length > 0) {
            console.log("promotionNotifications", data);
            cc.sys.localStorage.setItem(PromotionNotificationsStorageKey, JSON.stringify(data));
            this.count.string = data.length.toString();
            this.count.node.parent.active = true;
        }
    }

    onClickNotification() {
        const node = cc.instantiate(this.announcementPrefab);
        this.announcementContainer.addChild(node);
    }
}
