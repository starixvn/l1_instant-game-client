import { StorageManager } from "../StorageManager";

export function getTokenKey(): string {
    return "SSO_TOKEN";
}

export const getSSOToken = () => {
    return StorageManager.get().get(getTokenKey());
};

export function storeToken(token: string) {
    if (token) {
        StorageManager.get().set(getTokenKey(), token);
    }
}

export function isDifferentWithStoredToken(token: string) {
    return token !== getSSOToken();
}
