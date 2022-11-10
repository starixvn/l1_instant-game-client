import { getCookie, isLocalStorageAvailable, setCookie } from "../../common/helper/CookieHelper";

export function getTokenKey(): string {
    return "SSO_TOKEN";
}

export const getSSOToken = () => {
    return isLocalStorageAvailable() ? cc.sys.localStorage.getItem(getTokenKey()) : getCookie(getTokenKey());
};

export function storeToken(token: string) {
    if (token) {
        isLocalStorageAvailable() ? cc.sys.localStorage.setItem(getTokenKey(), token) : setCookie(getTokenKey(), token);
    }
}

export function isDifferentWithStoredToken(token: string) {
    return token !== getSSOToken();
}
