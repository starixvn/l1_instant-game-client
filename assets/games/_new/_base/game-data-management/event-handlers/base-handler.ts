import { GameData } from "../models/game-data";

export class BaseEventHandler<Event, Choices> {
  protected readonly gameData: GameData<Choices>;

  constructor(gameData: GameData<Choices>) {
    this.gameData = gameData;
  }

  onReceiveEvent(event: Event) {
    if (this.verifyEvent(event)) {
      this.handle(event);
    }
  }

  protected verifyEvent(event: Event): boolean {
    return true;
  }

  protected handle(event: Event) {}
}
