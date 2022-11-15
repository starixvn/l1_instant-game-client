import CommonDialog from "../CommonDialog";
import PromotionAnnouncementItem, { PromotionAnnouncementItemEvent } from "./PromotionAnnouncementItem";
import PromotionNotificationsHandler, { PromotionNotificationsEvent } from "./PromotionNotificationsHandler";
import { Promotions, PromotionsEvent } from "./Promotions";

const { ccclass, property } = cc._decorator;

export const PromotionAnnouncementEvent = {
    OPEN_GAME: "OPEN_GAME"
};
@ccclass
export default class PromotionAnnouncements extends cc.Component {
    @property(cc.Node)
    termConditionBoard: cc.Node = null;

    @property(cc.Node)
    promotionBoard: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    promoItemPrefab: cc.Prefab = null;

    @property(CommonDialog)
    dialog: CommonDialog = null;

    @property(cc.Label)
    count: cc.Label = null;

    @property(cc.Label)
    promoHeader: cc.Label = null;

    @property(cc.Label)
    termHeader: cc.Label = null;    

    public announcementItems: cc.Node[] = [];

    onPromotionClick() {
        this.onPromotionTab(true);
    }

    onTermClick() {
        this.onPromotionTab(false);
    }

    onPromotionTab(enabled: boolean) {
        this.termHeader.node.color = enabled ? cc.Color.WHITE : cc.color(254, 246, 0);
        this.promoHeader.node.color = enabled ? cc.color(254, 246, 0) : cc.Color.WHITE;
        this.promotionBoard.active = enabled;
        this.termConditionBoard.active = !enabled;
        this.promoHeader.node.getComponent(cc.LabelShadow).enabled = enabled;
        this.termHeader.node.getComponent(cc.LabelShadow).enabled = !enabled;
    }

    onLoad(): void {
        PromotionNotificationsHandler.getInstance().on(PromotionNotificationsEvent.NEW_PROMOTION, this.setData.bind(this));
        this.dialog.addOnDidHide(() => this.node.destroy());
        this.setData();
    }

    onDestroy() {
        PromotionNotificationsHandler.getInstance().removeAllListeners();
    }

    public setData() {
        const promotion = PromotionNotificationsHandler.getInstance()._promotionNotifications;
        const isRenderItem = PromotionNotificationsHandler.getInstance()._reloadAnnouncementPopup;
        if (promotion.length < 1) {
            this.dialog.closeDialog();
            return;
        }
        if (isRenderItem || this.announcementItems?.length < 1) {
            this.announcementItems?.forEach((item) => item.destroy());
            this.announcementItems = [];
            this.count.string = promotion.length.toString();
            this.count.node.parent.active = true;
            promotion.forEach((detail) => {
                const node = cc.instantiate(this.promoItemPrefab);
                this.content.addChild(node);
                const item = node.getComponent(PromotionAnnouncementItem);
                item.node.on(PromotionAnnouncementItemEvent.JOIN_GAME, (gameId) => this.handleClosePromotion(gameId));
                item.setData(detail);
                this.announcementItems.push(node);
            });
        }
    }

    handleClosePromotion(gameId) {
        Promotions.getInstance().emit(PromotionsEvent.OPEN_GAME, gameId);
        this.dialog.closeDialog();
    }
}
