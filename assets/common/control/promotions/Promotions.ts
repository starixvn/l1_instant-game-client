import NotificationService from "../../../manager/auth/NotificationService";
import { EventEmitter } from "events";

export const PromotionsEvent = {
    SHOW_BOOSTED_ODDS: "SHOW_BOOSTED_ODDS"
};

export class Promotions extends EventEmitter {
    private static instance: Promotions;

    constructor() {
        super();
        this.setMaxListeners(0);
    }

    private readonly dataKey = "promotions";
    public isShowBoostedOdds = true;
    protected timeout: any;
    private readonly delayTime = 120000;

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
        if (data.length > 0 && this.isShowBoostedOdds) {
            console.log("BoostedOddsEvent", data);
            this.emit(PromotionsEvent.SHOW_BOOSTED_ODDS);
            this.isShowBoostedOdds = false;
            this.setTimeoutShowBoostedOdds();
        }
    }

    setTimeoutShowBoostedOdds(): void {
        this.timeout && clearInterval(this.timeout);
        this.timeout = setTimeout(() => {
            this.isShowBoostedOdds = true;
        }, this.delayTime);
    }
}
