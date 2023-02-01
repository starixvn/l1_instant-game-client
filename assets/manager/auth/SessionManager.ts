import * as i18n from "i18n/runtime-scripts/LanguageData";
import { StorageManager } from "../StorageManager";
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
    StorageManager.get().remove(getSessionKey());
}

export function getSession() {
    return StorageManager.get().get(getSessionKey());
}

export function storeSessionData(data) {
    updateLanguage(data);
    StorageManager.get().set(getSessionKey(), data);
}

export function getLanguage(data) {
    const locale = data.language;
    const dict = {
        "vi-VN": "vi",
        "en-US": "en",
        "en-UK": "en",
        "th-TH": "th",
        "id-ID": "id",
        "zh-CN": "zh_cn",
        "zh-TW": "zh_tw"
    };
    return dict[locale] || "en";
}

export function getLocale(): string {
    const data = getSession();
    return data.language ?? "en";
}

export function updateLanguage(data) {
    const language = getLanguage(data);
    setLanguage(language);
}

export function setLanguage(language: string) {
    i18n.init(language);
    StorageManager.get().set("current_language", language);
}

export function getCacheLanguage(): string {
    return StorageManager.get().get("current_language") || "vi";
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
