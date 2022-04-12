import { BaseEventHandler } from "./base-handler";

export type TotalBetsEventType<Choices> = {
  totalBets: Choices;
};

export class TotalBetsEventHandler<Choices> extends BaseEventHandler<TotalBetsEventType<Choices>, Choices> {
  protected verifyEvent(event: TotalBetsEventType<Choices>) {
    return !!event.totalBets;
  }

  protected handle(event: TotalBetsEventType<Choices>) {
    this.gameData.totalBets.update(event.totalBets);
  }
}
