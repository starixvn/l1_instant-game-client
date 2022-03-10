import { CommonEvents } from "../models/common-events";
import { BaseEventHandler } from "./base-handler";

export type UMEventType = {
  um: boolean;
  um_message: string;
  disabledMessage: string;
  notice: {
    load: boolean;
    text: string;
    title: string;
  };
};

export class UMHandler<Choices> extends BaseEventHandler<UMEventType, Choices> {
  protected verifyEvent(event: UMEventType) {
    return typeof event.um === "boolean";
  }

  protected handle(event: UMEventType) {
    this.gameData.isUnderMaintenance = event.um;

    if (event.um) {
      this.gameData.emit(CommonEvents.UM, event.um_message || event.disabledMessage || event.notice.text);
    }
  }
}
