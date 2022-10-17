import NotificationService from "../../../manager/auth/NotificationService";
import { EventEmitter } from "events";
import { GameIds } from "../../../configs/SabaConfigs";

export const PromotionsEvent = {
    SHOW_BOOSTED_ODDS: "SHOW_BOOSTED_ODDS",
    OPEN_GAME: "OPEN_GAME"
};

export class Promotion {
    gameId: number;
    _id: string;
    endDateTime: string;
    isDaily: boolean;
    odds: any;
    startDateTime: string;
    status: string;
    time: string;
}

export const promotion: Promotion = {
    gameId: 0,
    _id: "id",
    endDateTime: "",
    isDaily: false,
    odds: {},
    startDateTime: "",
    status: ",",
    time: ""
};

export class Promotions extends EventEmitter {
    private static instance: Promotions;

    private readonly dataKey = "promotions";
    public isShowBoostedOdds = true;
    protected timeout: any;
    private readonly minutesToMillisecond = 60 * 1000;
    private readonly delayTime = 15 * this.minutesToMillisecond;
    protected promotions: Promotion[] = [promotion];
    private readonly supportPromotion = [GameIds.BigSmall, GameIds.MiniSedie];

    public static getInstance(): Promotions {
        if (!this.instance) {
            this.instance = new Promotions();
        }

        return this.instance;
    }

    addDataObserver() {
        NotificationService.getInstance().addDataObserver(this.dataKey, this.dataKey, this.receivedData.bind(this));
    }

    removeDataObserver() {
        NotificationService.getInstance().removeDataObserver(this.dataKey, this.dataKey);
    }

    receivedData(data) {
        const offerGames = [...cc.GameManager.user.offerGames];
        const newPromotion = data.filter(
            (promotion) => this.supportPromotion.includes(promotion.gameId) && offerGames?.includes(promotion.gameId)
        );
        if (newPromotion.length > 0) {
            let haveNewPromotion = newPromotion.length > this.promotions.length;
            if (!haveNewPromotion) {
                const filterNewPromotion = data.filter(
                    (newPromotion) =>
                        !this.promotions.some(
                            (currentPromotion) =>
                                newPromotion._id === currentPromotion._id &&
                                newPromotion.startDateTime === currentPromotion.startDateTime &&
                                newPromotion.endDateTime === currentPromotion.endDateTime
                        )
                );
                haveNewPromotion = filterNewPromotion.length > 0;
            }
            if (haveNewPromotion || this.isShowBoostedOdds) {
                this.emitEvent();
            }

            this.isShowBoostedOdds = false;

            this.promotions = newPromotion;
        }
    }

    emitEvent() {
        console.log("BoostedOddsEvent");
        this.emit(PromotionsEvent.SHOW_BOOSTED_ODDS);
        this.setTimeoutShowBoostedOdds();
    }

    setTimeoutShowBoostedOdds(): void {
        this.timeout && clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.isShowBoostedOdds = true;
        }, this.delayTime);
    }
}
