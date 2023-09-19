import axios from "axios";
import { buildClientUrl } from "../common/helper/UrlHelper";

export interface GameConfiguration {
    id: number;
    currencyGroupId?: string;
    name: string;
    key: string;
    route?: string;
    isMicrosite?: boolean;
    hasInstant?: boolean;
}

declare global {
    interface Window {
        gameConfigurations: GameConfiguration[];
    }
}

export async function initialize() {
    const url = buildClientUrl("/game/configurations/");
    let configurations = [];
    let retryCount = 0;
    while (retryCount < 3) {
        cc.log("try load configuration ", retryCount);
        configurations = await axios
            .get(url)
            .then((response) => response.data)
            .catch(() => []);

        if (configurations.length > 0) {
            break;
        }
        retryCount++;
        await delayTime(3);
    }

    window.gameConfigurations = configurations.filter((config) => config.isMicrosite && config.hasInstant);
}

function delayTime(seconds: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, seconds * 1000);
    });
}

export function isMicrositeGame(gameId: number) {
    const gameConfiguration = getGameConfiguration(gameId);

    return gameConfiguration?.isMicrosite;
}

export function getMicrositeGameIds() {
    return getAllGameConfigurations().map((configuration) => configuration.id);
}

export function getGameConfiguration(gameId: number | string) {
    return getAllGameConfigurations().find((configuration) => configuration.id === Number(gameId));
}

export function getAllGameConfigurations() {
    if (CC_EDITOR) {
        return [];
    }

    return window.gameConfigurations;
}
