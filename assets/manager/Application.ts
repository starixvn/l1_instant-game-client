import "reflect-metadata";

import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";

import ChipConfig from "../common/control/bet-chip/ChipConfig";
import SocketIOController from "../manager/SocketIOController";

export class Application {
    constructor(public readonly container = new Container()) {}

    startup() {
        this.configureServices();
    }

    configureServices() {
        this.container.bind<SocketIOController>(SocketIOController).toSelf().inSingletonScope();
        this.container.bind<ChipConfig>(ChipConfig).toSelf().inSingletonScope();
    }
}

const app = new Application();
app.startup();

const { lazyInject } = getDecorators(app.container);
const appContainer = app.container;
export { lazyInject, appContainer };
