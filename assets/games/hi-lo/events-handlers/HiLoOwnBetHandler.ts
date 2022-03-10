import { BetType, HiLoOwnBetsModel } from "../events-models/HiLoOwnBetsModel";
import HiLoEventHandler from "./HiLoEventHandler";

export type HiLoBetType<Choices> = {
    ownBets: BetType;
};

export class HiLoOwnBetHandler<Choices> extends HiLoEventHandler<HiLoBetType<Choices>, Choices> {
    protected verifyEvent(data: HiLoBetType<Choices>) {
        return !!data.ownBets;
    }

    protected handle(data: HiLoBetType<Choices>) {
        if (data.ownBets.roundId) {
            this.gameData.ownBetsModel.change(data.ownBets, HiLoOwnBetsModel.Events.CHANGE);
            this.gameData.stateModel.inTurn();
            this.gameData.durations.remaining = data.ownBets.remainingTime;
            this.gameData.roundCounter.change(data.ownBets.roundId);
        } else {
            this.gameData.stateModel.prepareNewRound();
        }
    }
}
