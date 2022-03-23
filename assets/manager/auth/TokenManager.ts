export function getTokenKey() {
    return "SSO_TOKEN";
}

export const getSSOToken = () => {
    return cc.sys.localStorage.getItem(getTokenKey());
};

export function storeToken(token: string) {
    token && cc.sys.localStorage.setItem(getTokenKey(), token);
}

export function isDifferentWithStoredToken(token: string) {
    return token !== getSSOToken();
}
