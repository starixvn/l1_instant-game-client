import { injectable } from "inversify";

import { ICashSystem, ICreditSystem, System } from "../../../manager/System";

@injectable()
export default class OldMiniGameConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
    }

    gameConfigs: any;
    dragonTigerChoicesMaxbet: any;

    customizeCredit(): void {
        this.gameConfigs = {
            minbet: 1,
            maxbet: 2000,
            choices_maxbet: {},
            odds: {
                even: 1.96
            }
        };

        this.dragonTigerChoicesMaxbet = {
            dragon: 2000,
            tie: 500
        };
    }

    customizeCash(): void {
        this.gameConfigs = {
            minbet: 10,
            maxbet: 20000,
            choices_maxbet: {},
            odds: {
                even: 1.96
            }
        };

        this.dragonTigerChoicesMaxbet = {
            dragon: 20000,
            tie: 2000
        };
    }
}
