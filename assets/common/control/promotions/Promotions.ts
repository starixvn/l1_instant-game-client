import NotificationService from "../../../manager/auth/NotificationService";
import { EventEmitter } from "events";

export const PromotionsEvent = {
    SHOW_BOOSTED_ODDS: "SHOW_BOOSTED_ODDS"
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
    private readonly delayTime = 1 * this.minutesToMillisecond;
    protected promotions: Promotion[] = [promotion];

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
        this.timeout && clearInterval(this.timeout);
    }

    receivedData(data) {
        if (data.length > 0) {
            let haveNewPromotion = data.length > this.promotions.length;
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

            this.promotions = data;
        }
    }

    emitEvent() {
        console.log("BoostedOddsEvent");
        this.emit(PromotionsEvent.SHOW_BOOSTED_ODDS);
        this.setTimeoutShowBoostedOdds();
    }

    setTimeoutShowBoostedOdds(): void {
        this.timeout && clearInterval(this.timeout);
        this.timeout = setTimeout(() => {
            this.isShowBoostedOdds = true;
        }, this.delayTime);
    }
}
