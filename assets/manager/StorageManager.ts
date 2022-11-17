interface ActionStorage {
    remove: (name: string) => void;
    get: (name: string) => string;
    set: (name: string, value: string, expiresDay?: number) => void;
    isAvailable: () => boolean;
}

class LocalStorage implements ActionStorage {
    remove(name: string) {
        cc.sys.localStorage.removeItem(name);
    }

    get(name: string) {
        const storage = cc.sys.localStorage.getItem(name);
        try {
            return storage ? JSON.parse(storage) : null;
        } catch (error) {
            return storage ?? null;
        }
    }

    set(name: string, value: string) {
        cc.sys.localStorage.setItem(name, JSON.stringify(value));
    }

    isAvailable() {
        const test = "test";
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.log("Browser not support Local Storage");
            return false;
        }
    }
}

class Cookie implements ActionStorage {
    remove(name: string) {
        this.set(name, "", 0);
    }

    get(name: string) {
        name = name + "=";
        const cDecoded = decodeURIComponent(document.cookie);
        const cArr = cDecoded.split("; ");
        let result;
        cArr.forEach((val) => {
            if (val.indexOf(name) === 0) {
                result = val.substring(name.length);
            }
        });

        return result;
    }

    set(name: string, value: string, expiresDay = 1) {
        const date = new Date();
        date.setTime(date.getTime() + expiresDay * 24 * 60 * 60 * 1000);
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    isAvailable() {
        return false;
    }
}

class Session implements ActionStorage {
    remove(name: string) {
        sessionStorage.removeItem(name);
    }

    get(name: string) {
        const storage = sessionStorage.getItem(name);
        return storage ? JSON.parse(storage) : null;
    }

    set(name: string, value: string) {
        sessionStorage.setItem(name, JSON.stringify(value));
    }

    isAvailable() {
        return false;
    }
}

class URLParams implements ActionStorage {
    remove(name: string) {
        const currentUrl = new URL(location.href);
        const urlParams = new URLSearchParams(currentUrl.search);
        urlParams.delete(name);
        try {
            history.pushState("", "", currentUrl);
        } catch (error) {
            console.log(error);
        }
    }

    get(name: string) {
        const urlParams = new URLSearchParams(location.search);
        const value = urlParams.get(name);
        return value ? JSON.parse(value) : null;
    }

    set(name: string, value: string) {
        const urlParams = new URLSearchParams(location.search);
        urlParams.set(name, JSON.stringify(value));
        try {
            window.parent.history.pushState("", "", `${location.pathname}?${urlParams.toString()}`);
        } catch (error) {
            console.log(error);
        }
    }

    isAvailable() {
        return false;
    }
}

class Memory implements ActionStorage {
    remove(name: string) {
        window[name] = "";
    }

    get(name: string) {
        return window[name] ? JSON.parse(window[name]) : null;
    }

    set(name: string, value: string) {
        window[name] = JSON.stringify(value);
    }

    isAvailable() {
        return true;
    }
}

class StorageManager {
    static supportStorage: ActionStorage;

    static get() {
        if (!StorageManager.supportStorage) {
            const allStorage = [new LocalStorage(), new Memory()];

            // default Memory storage always is available.
            StorageManager.supportStorage = allStorage.filter((storage) => storage.isAvailable())[0];
        }

        return StorageManager.supportStorage;
    }
}

export { StorageManager };
