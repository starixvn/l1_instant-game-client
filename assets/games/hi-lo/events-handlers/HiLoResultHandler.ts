import { BetType } from "../events-models/HiLoOwnBetsModel";
import { HiLoResultModel } from "../events-models/HiLoResultModel";
import HiLoEventHandler from "./HiLoEventHandler";

export type HiLoResultType<Choices> = {
    result: BetType;
};

export class HiLoResultHandler<Choices> extends HiLoEventHandler<HiLoResultType<Choices>, Choices> {
    protected verifyEvent(data: HiLoResultType<Choices>) {
        return !!data.result;
    }

    protected handle(data: HiLoResultType<Choices>) {
        this.gameData.resultModel.change(data.result, HiLoResultModel.Events.CHANGE);
        this.gameData.stateModel.inTurn();
        this.gameData.durations.remaining = data.result.remainingTime;
        this.gameData.roundCounter.change(data.result.roundId);
    }
}
