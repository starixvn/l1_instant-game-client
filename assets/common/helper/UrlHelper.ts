import * as configs from "../../configs/Configs";
import { GameInfos } from "../../configs/SabaConfigs";

export function buildUrl(protocol = "http", path = "/") {
    const ssl = configs.ssl;
    const domain = getRootDomain();
    const subDomain = configs.subDomain;
    const subDomainText = `${subDomain}.`;
    return `${protocol}${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${domain}${path}`;
}

export function getRootDomain() {
    const hostName = window.location.hostname;
    return (!!configs.serverDomainMapper && configs.serverDomainMapper[hostName]) || extractDomainFromHostName(hostName);
}

export function extractDomainFromHostName(hostName) {
    const domainParts = hostName.split(".").reverse();
    return `${domainParts[1]}.${domainParts[0]}`;
}

export function buildGameGuideUrl() {
    const ssl = configs.ssl;
    const rootDomain = getRootDomain();
    const subGuideDomainText = `${configs.subGuideDomain}.`;

    return `${"http"}${ssl ? "s" : ""}://${subGuideDomainText}${rootDomain}`;
}

export function getUserServiceUrl() {
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
