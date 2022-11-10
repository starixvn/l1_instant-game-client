import * as i18n from "i18n/runtime-scripts/LanguageData";
import { getCookie, isLocalStorageAvailable, removeCookie, setCookie } from "../../common/helper/CookieHelper";
declare global {
    export interface Window {
        i18n: {
            languages: any;
            curLang: string;
        };
    }
}
export interface Session {
    username: string;
    language: string;
    ss: string;
    time: Date;
    isAuthenticated: boolean;
}

const sessionIdStorageName = "scss";

export function getSessionKey() {
    if (window.location && window.location.hostname) {
        return `${window.location.hostname}.${sessionIdStorageName}`;
    }

    return sessionIdStorageName;
}

export function removeSession() {
    isLocalStorageAvailable() ? cc.sys.localStorage.removeItem(getSessionKey()) : removeCookie(getSessionKey());
}

export function getSession(): Session {
    const storage = isLocalStorageAvailable() ? cc.sys.localStorage.getItem(getSessionKey()) : getCookie(getSessionKey());
    return storage ? JSON.parse(storage) : null;
}

export function storeSessionData(data) {
    updateLanguage(data);
    isLocalStorageAvailable()
        ? cc.sys.localStorage.setItem(getSessionKey(), JSON.stringify(data))
        : setCookie(getSessionKey(), JSON.stringify(data));
}

function getLanguage(data) {
    let language = "";
    const locale = data.language;
    switch (locale) {
        case "vi-VN":
            language = "vi";
            break;
        case "en-US":
        case "en-UK":
            language = "en";
            break;
        default:
            language = "en";
            break;
    }
    return language;
}

export function getLocale() {
    const data = getSession();
    return data.language;
}

export function updateLanguage(data) {
    const language = getLanguage(data);
    setLanguage(language);
}

export function setLanguage(language: string) {
    i18n.init(language);
    cc.sys.localStorage.setItem(`current_language`, language);
}

export function getCacheLanguage(): string {
    return cc.sys.localStorage.getItem(`current_language`) || "vi";
}

export function getInRoomGameIdKey() {
    const session = getSession();

    return session ? `${session.ss}_inroomgame` : "";
}

export function storeInRoomGameId(gameId) {
    cc.sys.localStorage.setItem(getInRoomGameIdKey(), gameId);
}

export function getInRoomGameId() {
    return cc.sys.localStorage.getItem(getInRoomGameIdKey());
}

export function removeInRoomGameId() {
    cc.sys.localStorage.removeItem(getInRoomGameIdKey());
}

declare global {
    interface Window {
        reCheckInId: any;
        umInfo: any;
        authData: Session;
        openGameId: string;
    }
}
