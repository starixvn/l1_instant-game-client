import * as configs from "../../configs/Configs";
import { GameInfos } from "../../configs/SabaConfigs";

export function buildUrl(subDomain, hostName, ssl, protocol = "http", path = "/", port = 80) {
    const subDomainText = `${subDomain}.`;
    const portText = `:${port}`;
    return `${protocol}${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${hostName}${port === "" ? "" : portText}${path}`;
}

export function buildServerUrl(ssl, protocol = "http", path = "/", gameId = 0) {
    const serverHostName = configs.serverDomainMapper[window.location.hostname];

    const subDomain = configs.subDomain;
    const gamePath = getPath(gameId);

    return buildUrl(subDomain, serverHostName, ssl, protocol, gamePath + path, "");
}

export function getPath(gameId) {
    const env = configs.env;
    const info = GameInfos[gameId];
    const key = info.key;
    const path = info.path || key.toLowerCase();
    let pathStr = "";
    if (gameId === 0) {
        let envStr = "";
        if (env.length > 0) {
            envStr = `${env}/`;
        }
        pathStr = `/${envStr}${path}`;
    } else {
        pathStr = `/user/${path}`;
    }

    return pathStr;
}

export function getProxyRoute(gameId) {
    const env = configs.env;
    const info = GameInfos[gameId];
    const key = info.key;
    const route = info.route || key.toLowerCase();
    let routeStr = "";
    let envStr = "";
    if (env.length > 0) {
        envStr = `${env}/`;
    }
    routeStr = `/${envStr}${route}/socket.io`;

    return routeStr;
}
