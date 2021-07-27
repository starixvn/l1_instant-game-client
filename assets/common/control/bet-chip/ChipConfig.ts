import { injectable } from "inversify";

import { ICashSystem, ICreditSystem, System } from "../../../manager/System";

@injectable()
export default class ChipConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
    }

    private chipSpriteDict: any;
    public chipOption: number[];

    customizeCredit(): void {
        this.chipSpriteDict = {
            0.5: 13,
            1: 0,
            5: 2,
            10: 3,
            20: 12,
            50: 4,
            100: 5,
            200: 6,
            500: 7,
            1000: 8,
            2000: 9,
            3000: 10,
            5000: 11
        };
        this.chipOption = Object.keys(this.chipSpriteDict)
            .map((key) => +key)
            .sort((a, b) => b - a); //sort ascending
    }

    customizeCash(): void {
        this.chipSpriteDict = {
            5: 13,
            10: 0,
            20: 1,
            50: 2,
            100: 3,
            200: 4,
            500: 5,
            1000: 6,
            2000: 14,
            5000: 7,
            10000: 12,
            20000: 8
        };
        this.chipOption = Object.keys(this.chipSpriteDict)
            .map((key) => +key)
            .sort((a, b) => b - a); //sort ascending
    }

    getBigChipSpriteName(value: number): string {
        return `chip_${this.chipSpriteDict[value]}`;
    }

    getSmallChipSpriteName(value: number): string {
        return `small_chip_${this.chipSpriteDict[value]}`;
    }
}
