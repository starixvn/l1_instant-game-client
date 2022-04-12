import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import HiLoGameData from "../events-models/HiLoGameData";

export default class HiLoEventHandler<Event, Choices> extends BaseEventHandler<Event, Choices> {
    protected readonly gameData: HiLoGameData<Choices>;
}
