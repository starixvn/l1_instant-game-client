import { EventEmitter } from "events";
import NotificationService from "../../../manager/auth/NotificationService";
import { gameIdsSupportBoostedOddsForInstantSite } from "../../../configs/Configs";

export const PromotionNotificationsEvent = {
    NEW_PROMOTION: "NEW_PROMOTION"
};

export class PromotionNotification {
    displayKind: number;
    enabled: boolean;
    gameId: number;
    gameName: string;
    _id: string;
    isActive: boolean;
    messages: any;
    promotionId: string;
    time: string;
    title: any;
    endTime: string;
    startTime: string;
}
export default class PromotionNotificationsHandler extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(0);
    }

    private static instance: PromotionNotificationsHandler;

    private readonly dataKey = "promotionNotifications";

    public _reloadAnnouncementPopup = false;

    public _promotionNotifications: PromotionNotification[];

    public static getInstance(): PromotionNotificationsHandler {
        if (!this.instance) {
            this.instance = new PromotionNotificationsHandler();
        }

        return this.instance;
    }

    get reloadAnnouncementPopup() {
        return this._reloadAnnouncementPopup;
    }

    get promotionNotifications() {
        return this._promotionNotifications;
    }

    addDataObserver() {
        NotificationService.getInstance().addDataObserver(this.dataKey, this.dataKey, this.receivedData.bind(this));
    }

    removeDataObserver() {
        NotificationService.getInstance().removeDataObserver(this.dataKey, this.dataKey);
    }

    receivedData(data: PromotionNotification[]) {
        const offerGames = [...cc.GameManager.user.offerGames];
        console.log(`main gameIdsSupportBoostedOddsForInstantSite: ${gameIdsSupportBoostedOddsForInstantSite}`);
        const offerGamesConfigs = gameIdsSupportBoostedOddsForInstantSite.split(",");
        const newPromotionNotification = data.filter(
            (promotionNotification) =>
                offerGamesConfigs.some((gameId) => {
                    return parseInt(gameId) === promotionNotification.gameId;
                }) && offerGames?.includes(promotionNotification.gameId)
        );
        if (JSON.stringify(this._promotionNotifications) === JSON.stringify(newPromotionNotification)) {
            this._reloadAnnouncementPopup = false;
        } else {
            this._reloadAnnouncementPopup = true;
        }
        this._promotionNotifications = newPromotionNotification;
        this.emit(PromotionNotificationsEvent.NEW_PROMOTION, newPromotionNotification);
    }
}
