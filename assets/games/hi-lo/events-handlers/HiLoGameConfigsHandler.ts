import HiLoEventHandler from "./HiLoEventHandler";
export type ConfigsType<Choices> = {
    gameConfigs: {
        maxBet: number;
        minBet: number;
        chips: any;
    };
};

export class HiLoGameConfigsHandler<Choices> extends HiLoEventHandler<ConfigsType<Choices>, Choices> {
    protected verifyEvent(data: ConfigsType<Choices>) {
        return data.gameConfigs != null;
    }

    protected handle(data: ConfigsType<Choices>) {
        this.gameData.configs.change(data.gameConfigs);
    }
}
