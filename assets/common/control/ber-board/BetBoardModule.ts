import { appContainer } from "../../../manager/Application";
import BetBoardConfig from "./BetBoardConfig";

export default class BetBoardModule {
    constructor() {
        appContainer.bind<BetBoardConfig>(BetBoardConfig).toSelf().inSingletonScope();
    }
}

new BetBoardModule();
