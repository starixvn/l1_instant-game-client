import { EventEmitter } from "events";

export class TotalBets<Choices> extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0);
  }

  static Events = {
    CHANGE: "totalBets:change",
  };

  protected data: Choices;

  update(choices: Choices) {
    this.data = choices;
    this.emit(TotalBets.Events.CHANGE, this.data);
  }
}
