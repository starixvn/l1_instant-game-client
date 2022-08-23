import * as configs from "../../configs/Configs";
import { GameInfos } from "../../configs/SabaConfigs";

export function buildUrl(protocol = "http", path = "/") {
    const ssl = configs.ssl;
    const hostName = configs.serverDomainMapper[window.location.hostname];
    const subDomain = configs.subDomain;
    const subDomainText = `${subDomain}.`;
    return `${protocol}${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${hostName}${path}`;
}

export function getUserServiceURL() {
    const path = configs.env === "" ? "/user" : `/${configs.env}/user`;
    return buildUrlWithPath(path);
}

export function buildUrlWithPath(path) {
    return buildUrl("http", path);
}

export function buildServerUrl(protocol = "http", path = "/", gameId = 0) {
    const gamePath = getPath(gameId);
    return buildUrl(protocol, gamePath + path);
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
    const info = GameInfos[gameId];
    const key = info.key;
    const route = info.route || key.toLowerCase();

    return `/${getEnvironment()}${route}/socket.io`;
}

export function getEnvironment() {
    const env = configs.env;
    let envStr = "";
    if (env.length > 0) {
        envStr = `${env}/`;
    }

    return envStr;
}
