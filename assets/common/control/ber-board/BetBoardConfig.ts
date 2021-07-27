import { ICashSystem, ICreditSystem, System } from "../../../manager/System";

export default class BetBoardConfig extends System implements ICreditSystem, ICashSystem {
    items: string[];
    presetItems: string[];
    MAX_BET: number;
    shortenValue: boolean;

    customizeCash(): void {
        this.items = ["10", "50", "100", "200", "500", "1000", "5000", "MAX"];
        this.presetItems = ["10", "50", "100", "200", "500", "1000", "5000", "20000"];
        this.MAX_BET = 20000;
        this.shortenValue = true;
    }
    customizeCredit(): void {
        this.items = ["1", "5", "10", "50", "100", "200", "500", "1000"];
        this.presetItems = ["1", "5", "10", "50", "100", "200", "500", "1000"];
        this.MAX_BET = 2000;
        this.shortenValue = false;
    }
}
