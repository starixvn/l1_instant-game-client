import * as i18n from "i18n/runtime-scripts/LanguageData";

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
    cc.sys.localStorage.removeItem(getSessionKey());
}

export function getSession(): Session {
    const storage = cc.sys.localStorage.getItem(getSessionKey());
    return storage !== "" ? JSON.parse(storage) : null;
}

export function storeSessionData(data) {
    updateLanguage(data);
    cc.sys.localStorage.setItem(getSessionKey(), JSON.stringify(data));
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
    console.log(`i18n init language ${data.language} => ${language}`);
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
